import { DataStore } from "../../store/data.store";
import { StoreModule } from "../../store/store.module";
import * as fs from "fs";
import {
  Module,
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Controller,
  All,
  Req,
  BadRequestException,
} from "@nestjs/common";
import { Roles } from "../../common/roles.decorator";
import * as path from "path";
import { pathToFileURL } from "url";
const load = (file: string) =>
  new Function("p", "return import(p)")(
    pathToFileURL(path.join(process.cwd(), "algo", file)).href,
  );
@Controller("algo")
@Roles("learner", "instructor", "superuser")
class AlgoController {
  constructor(private db: DataStore) {}
  @All("{*route}") async route(@Req() req: any) {
    try {
      const [server, store] = await Promise.all([
        load("server.mjs"),
        load("store.mjs"),
      ]);
      const u = new URL(req.originalUrl, "http://localhost");
      const p = u.pathname.replace("/api/algo", "/api");
      return {
        success: true,
        data: await store.withUser(req.user.id, async () => {
          const result = await server.routes(req.method, p, u.searchParams, req.body || {}, {maxDailyTrades:this.db.config.maxDailyTrades,cooldown:this.db.config.cooldown,tradingLimit:req.user.tradingLimit});
          if (p === "/api/portfolio" || req.method !== "GET") {
            const portfolio = p === "/api/portfolio" ? result : store.markPortfolio({},false);
            const account = this.db.getUser(req.user.id);
            if (account) { account.virtualBalance = portfolio.cash; account.portfolioValue = portfolio.netWorth; this.db.save(); }
          }
          return result;
        }),
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
@Injectable()
class AlgoScheduler implements OnModuleInit, OnModuleDestroy {
  constructor(private db: DataStore) {}
  private timer: any;
  private busy = false;
  onModuleInit() {
    this.timer = setInterval(() => this.run(), 60000);
    this.timer.unref();
  }
  onModuleDestroy() {
    clearInterval(this.timer);
  }
  private async run() {
    if (this.busy) return;
    this.busy = true;
    try {
      const [server, store] = await Promise.all([
        load("server.mjs"),
        load("store.mjs"),
      ]);
      const directory = path.join(
        process.env.DATA_DIR || path.join(process.cwd(), "persistent-data"),
        "research",
      );
      if (!fs.existsSync(directory)) return;
      for (const u of this.db.users.filter(
        (u) =>
          u.status === "active" && ["learner", "instructor"].includes(u.role),
      )) {
        if (fs.existsSync(path.join(directory, u.id + ".json")))
          try {
            await store.withUser(u.id, async () => {
              await server.runPending();
              // Manual stock trading only; no autonomous strategy execution.
            });
          } catch (e) {
            console.error("Research scheduler:", u.id, e.message);
          }
      }
    } finally {
      this.busy = false;
    }
  }
}
@Module({
  imports: [StoreModule],
  controllers: [AlgoController],
  providers: [AlgoScheduler],
})
export class AlgoModule {}
