import {
  Module,
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import {
  IsEmail,
  IsString,
  MaxLength,
  IsArray,
  ArrayMaxSize,
} from "class-validator";
import { randomBytes, createHash } from "crypto";
import { DataStore } from "../../store/data.store";
import { StoreModule } from "../../store/store.module";
import { Roles } from "../../common/roles.decorator";
import { Public } from "../../common/public.decorator";
import { UsersModule } from "../users/users.module";
import { UsersService } from "../users/users.service";
import { parseCsv, writeCsv } from "./csv";
import { hashPassword } from "../../common/password.util";
class InviteDto {
  @IsEmail() email: string;
}
class CsvDto {
  @IsString() @MaxLength(1048576) csv: string;
}
class CredentialEmailDto {
  @IsArray() @ArrayMaxSize(500) userIds: string[];
}
async function mail(
  to: string,
  subject: string,
  text: string,
  attachment?: string,
) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_FROM)
    throw new ServiceUnavailableException(
      "Email is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and SMTP_FROM.",
    );
  const nodemailer = require("nodemailer");
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_PORT === "465",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
    connectionTimeout: 10000,
  });
  await transport.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    text,
    attachments: attachment
      ? [{ filename: "indai-credentials.csv", content: attachment }]
      : [],
  });
}
@Controller("institutes")
class InstitutesController {
  constructor(
    private db: DataStore,
    private users: UsersService,
  ) {}
  private admin(req: any) {
    if (!(
      req.user.role === "superuser" ||
      (req.user.role === "admin" && req.user.adminTeam === "USER_ADMIN")
    ))
      throw new ForbiddenException("User Admin access required.");
  }
  private org(id: string) {
    const o = this.db.organizations.find((x) => x.id === id);
    if (!o) throw new NotFoundException("Institution not found.");
    return o;
  }
  private token(raw: string) {
    const h = createHash("sha256").update(raw).digest("hex");
    const r = this.db.instituteRequests.find(
      (x) => x.tokenHash === h && Date.parse(x.expiresAt) > Date.now(),
    );
    if (!r || r.status === "IMPORTED")
      throw new BadRequestException("Intake link expired or already used.");
    return r;
  }
  @Post(":id/invite") @Roles("admin", "superuser") async invite(
    @Param("id") id: string,
    @Body() b: InviteDto,
    @Req() req: any,
  ) {
    this.admin(req);
    const o = this.org(id);
    const raw = randomBytes(32).toString("hex");
    const url =
      (process.env.PUBLIC_URL || "http://localhost:5173").replace(/\/$/, "") +
      "/institute-intake/" +
      raw;
    const row = {
      id: this.db.id("intake"),
      organizationId: id,
      email: b.email,
      tokenHash: createHash("sha256").update(raw).digest("hex"),
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      status: "INVITED",
      csv: "",
      createdAt: new Date().toISOString(),
    };
    this.db.instituteRequests.push(row);
    this.db.save();
    // Explicit action sends the invitation. A failed SMTP send is surfaced and the link remains usable.
    try {
      await mail(
        b.email,
        "IndAI institute account intake",
        `Hello ${o.name},\nComplete your account intake here (valid 7 days):\n${url}\nDownload the CSV template and submit learner/instructor/provider details. Do not send existing passwords.`,
      );
      return { success: true, data: { url, sent: true } };
    } catch (e) {
      return { success: true, data: { url, sent: false, message: e.message } };
    }
  }
  @Public() @Get("intake/:token") intake(@Param("token") raw: string) {
    const r = this.token(raw);
    return {
      success: true,
      data: {
        name: this.org(r.organizationId).name,
        status: r.status,
        expiresAt: r.expiresAt,
      },
    };
  }
  @Public() @Post("intake/:token") submit(
    @Param("token") raw: string,
    @Body() b: CsvDto,
  ) {
    const r = this.token(raw);
    const rows = parseCsv(b.csv);
    if (!rows.length) throw new BadRequestException("CSV is empty.");
    r.csv = b.csv;
    r.status = "SUBMITTED";
    r.submittedAt = new Date().toISOString();
    this.db.save();
    return { success: true, data: { submitted: rows.length } };
  }
  @Get(":id/requests") @Roles("admin", "superuser") requests(
    @Param("id") id: string,
    @Req() req: any,
  ) {
    this.admin(req);
    return {
      success: true,
      data: this.db.instituteRequests
        .filter((x) => x.organizationId === id)
        .map(({ tokenHash, ...r }) => r),
    };
  }
  private prepare(id: string, text: string, req: any) {
    this.admin(req);
    const org = this.org(id);
    const rows = parseCsv(text);
    const seen = new Set();
    const records = rows.map((r, i) => {
      const role = r.role?.toLowerCase() || "learner",
        email = r.email?.toLowerCase();
      if (!["learner", "instructor", "provider"].includes(role))
        throw new BadRequestException(`Row ${i + 2}: invalid role.`);
      if (
        !/^[a-z][a-z .'-]{1,79}$/i.test(r.firstName || "") ||
        !/^[a-z][a-z .'-]{1,79}$/i.test(r.lastName || "")
      )
        throw new BadRequestException(
          `Row ${i + 2}: names must have 2–80 letters.`,
        );
      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "") ||
        seen.has(email) ||
        this.db.findUserByEmail(email)
      )
        throw new BadRequestException(
          `Row ${i + 2}: email invalid or already exists: ${email}`,
        );
      seen.add(email);
      if (
        role === "learner" &&
        (!r.studentId ||
          this.db.users.some(
            (u) => u.organizationId === id && u.studentId === r.studentId,
          ) ||
          rows.some((x, j) => j < i && x.studentId === r.studentId))
      )
        throw new BadRequestException(
          `Row ${i + 2}: studentId missing or duplicated.`,
        );
      if (role === "instructor" && (!r.expertise || !r.yearsExp))
        throw new BadRequestException(
          `Row ${i + 2}: expertise and yearsExp required.`,
        );
      return { ...r, role, email };
    });
    if (!records.length) throw new BadRequestException("CSV is empty.");
    if (
      this.db.users.filter((u) => u.organizationId === id).length +
        records.length >
      org.seats
    )
      throw new BadRequestException("Institution seat limit exceeded.");
    return { org, records };
  }
  @Post(":id/preview") @Roles("admin", "superuser") preview(
    @Param("id") id: string,
    @Body() b: CsvDto,
    @Req() req: any,
  ) {
    const { records } = this.prepare(id, b.csv, req);
    return { success: true, data: { count: records.length, rows: records } };
  }
  @Post(":id/import") @Roles("admin", "superuser") importCsv(
    @Param("id") id: string,
    @Body() b: CsvDto,
    @Req() req: any,
  ) {
    const { org, records } = this.prepare(id, b.csv, req);
    if (org.licenseStatus !== "ACTIVE")
      throw new BadRequestException(
        "Activate the institution license before creating accounts.",
      );
    // Validate every row before mutating. Only hashes are retained; generated passwords are returned once.
    const credentials: any[] = records.map((r) => ({
      ...r,
      id: this.db.id("u"),
      password: "Ind@" + randomBytes(12).toString("hex"),
    }));
    const accounts = credentials.map((r) => ({
      id: r.id,
      firstName: r.firstName,
      lastName: r.lastName,
      email: r.email,
      password: hashPassword(r.password),
      role: r.role,
      status: "active",
      organizationId: id,
      institution: org.name,
      organization: org.name,
      studentId: r.studentId,
      expertise: r.expertise,
      yearsExp: r.yearsExp,
      startingBalance: r.role === "learner" ? 100000 : 0,
      virtualBalance: r.role === "learner" ? 100000 : 0,
      portfolioValue: r.role === "learner" ? 100000 : 0,
      tradingLimit: 150000,
      skillPoints: 0,
      providerVerified: false,
      subscriptionTier: "FREE",
      createdAt: new Date().toISOString(),
    }));
    this.db.users.push(...(accounts as any[]));
    org.memberCount = this.db.users.filter(
      (u) => u.organizationId === id,
    ).length;
    for (const r of this.db.instituteRequests.filter(
      (x) => x.organizationId === id && x.csv === b.csv,
    ))
      r.status = "IMPORTED";
    this.db.audit("INSTITUTE_CSV_IMPORTED", req.user.id, {
      organizationId: id,
      count: accounts.length,
    });
    this.db.save();
    return {
      success: true,
      data: {
        count: credentials.length,
        userIds: credentials.map((r) => r.id),
        csv: writeCsv([
          ["firstName", "lastName", "email", "role", "password"],
          ...credentials.map((r) => [
            r.firstName,
            r.lastName,
            r.email,
            r.role,
            r.password,
          ]),
        ]),
      },
    };
  }
  @Post(":id/email-credentials") @Roles("admin", "superuser") async credentials(
    @Param("id") id: string,
    @Body() b: CredentialEmailDto,
    @Req() req: any,
  ) {
    this.admin(req);
    const org = this.org(id);
    if (!b.userIds.length || new Set(b.userIds).size !== b.userIds.length)
      throw new BadRequestException("Select unique imported accounts.");
    const users = b.userIds.map((uid) => this.db.getUser(uid));
    if (
      users.some(
        (u) =>
          !u ||
          u.organizationId !== id ||
          !["learner", "instructor", "provider"].includes(u.role),
      )
    )
      throw new BadRequestException("Invalid account selection.");
    // Regenerate only after explicit admin action; send before committing the new hashes.
    const rows = users.map((u) => ({
      u,
      password: "Ind@" + randomBytes(12).toString("hex"),
    }));
    const output = writeCsv([
      ["email", "role", "password"],
      ...rows.map((r) => [r.u.email, r.u.role, r.password]),
    ]);
    await mail(
      org.billingEmail,
      "IndAI institute credentials",
      "Please distribute these credentials securely. These passwords replace any earlier exported credentials.",
      output,
    );
    for (const r of rows) r.u.password = hashPassword(r.password);
    this.db.audit("INSTITUTE_CREDENTIALS_EMAILED", req.user.id, {
      organizationId: id,
      count: rows.length,
    });
    this.db.save();
    return { success: true, data: { sent: true, count: rows.length } };
  }
}
@Module({
  imports: [StoreModule, UsersModule],
  controllers: [InstitutesController],
})
export class InstitutesModule {}
