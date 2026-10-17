import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { tap } from "rxjs/operators";
import { DataStore } from "../store/data.store";
@Injectable()
export class PersistenceInterceptor implements NestInterceptor {
  constructor(private db: DataStore) {}
  intercept(c: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      tap(() => {
        const req=c.switchToHttp().getRequest();
        if(!["GET","HEAD","OPTIONS"].includes(req.method)){
          const route=String(req.route?.path||"");
          if(req.user && !route.includes("refresh") && !String(req.originalUrl).includes("/algo/orders/process"))
            this.db.audit("WORKFLOW_EVENT",req.user.id,{method:req.method,route});
          this.db.save();
        }

      }),
    );
  }
}
