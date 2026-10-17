import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from "@nestjs/common";
import { DataStore } from "../store/data.store";
@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private db: DataStore) {}
  canActivate(c: ExecutionContext) {
    const r = c.switchToHttp().getRequest(),
      u = r.user;
    if (!u || ["admin", "superuser"].includes(u.role)) return true;
    const p = String(r.originalUrl),
      id = r.params?.id,
      mutating = !["GET", "HEAD"].includes(r.method);
    const deny = () => {
      throw new ForbiddenException("This resource belongs to another account.");
    };
    for (const target of [
      r.params?.userId,
      r.params?.learnerId,
      r.body?.learnerId,
      r.body?.userId,
    ].filter(Boolean)) {
      if (target === u.id) continue;
      if (u.role === "provider" && p.includes("/assignments/") && p.includes("/approve/")) {
        const assignment = this.db.assignments.find(a => a.id === id);
        if (assignment?.providerId === u.id && (assignment.submissions || []).some(s => s.learnerId === target)) continue;
      }
      if (
        u.role === "instructor" &&
        this.db.getUser(target)?.instructorId === u.id
      )
        continue;
      deny();
    }
    if (u.role === "instructor") {
      if (
        p.includes("/users/") &&
        id &&
        this.db.getUser(id)?.instructorId !== u.id &&
        id !== u.id
      )
        deny();
      if (r.body?.instructorId && r.body.instructorId !== u.id) deny();
      for (const sid of r.body?.studentIds || [])
        if (this.db.getUser(sid)?.instructorId !== u.id) deny();
      const record = p.includes("/assignments/")
        ? this.db.assignments.find((x) => x.id === id)
        : p.includes("/sessions/")
          ? this.db.sessions.find((x) => x.id === id)
          : null;
      if (record && mutating && record.instructorId !== u.id) deny();
    }
    if (u.role === "provider") {
      if (r.body?.providerId && r.body.providerId !== u.id) deny();
      const courseId =
        r.params?.courseId ||
        r.body?.courseId ||
        (p.includes("/courses/") ? id : null);
      if (
        courseId &&
        mutating &&
        this.db.courses.find((x) => x.id === courseId)?.providerId !== u.id
      )
        deny();
      if (id && p.includes("/course-modules/") && mutating) {
        const m = this.db.courseModules.find((x) => x.id === id);
        if (
          m &&
          this.db.courses.find((x) => x.id === m.courseId)?.providerId !== u.id
        )
          deny();
      }
      if (id && p.includes("/assignments/") && mutating) {
        const a = this.db.assignments.find((x) => x.id === id);
        if (a?.providerId !== u.id) deny();
      }
      if (id && p.includes("/quizzes/") && mutating) {
        const q = this.db.quizzes.find((x) => x.id === id);
        if (q && (q.providerId || q.createdBy) !== u.id) deny();
      }
    }
    if (u.role === "learner" && id) {
      let owner;
      if (p.includes("/enrollments/"))
        owner = this.db.enrollments.find((x) => x.id === id)?.learnerId;
      if (p.includes("/notifications/"))
        owner = this.db.notifications.find((x) => x.id === id)?.userId;
      if (p.includes("/watchlists/"))
        owner = this.db.watchlists.find((x) => x.id === id)?.userId;
      if (p.includes("/users/")) owner = id;
      if (owner && owner !== u.id) deny();
    }
    return true;
  }
}
