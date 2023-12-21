import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Logger } from 'winston';
// import { tap } from 'rxjs/operators';

const actionsMap = {
    "GET": "VIEW",
    "POST": "CREATE",
    "PUT": "UPDATE",
    "DELETE": "DELETE"
};

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
    constructor(@Inject('winston') private logger: Logger) { }
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

        const requestData = this.requestDataExtractor(context.switchToHttp().getRequest());
        this.log(requestData);

        return next.handle()
            // .pipe(
            // tap(() => {
            //     // console.log('After route process');                
            // })
            // )
            ;
    }

    private requestDataExtractor(req: any): any {
        const body = { ...req.body };

        // Default password disposal treatment 
        delete body.password;
        delete body.passwordConfirmation;

        const user = (req as any).user;
        const userId = user ? user.id : null;

        return {
            method: req.method,
            route: req.route.path,
            data: {
                body: body,
                query: req.query,
                params: req.params,
            },
            ip: req.ip,
            userId: userId,
        };
    }

    private log(requestData: any) {
        // {
        //     timestamp: new Date().toISOString(),
        //     method: requestData.method,
        //     route: requestData.route,
        //     data: requestData.data,
        //     from: requestData.ip,
        //     madeBy: requestData.userId,
        // }
        let trail = `${requestData.method} ${requestData.route}`;
        if(requestData.data){
            if(requestData.data.params && !this.isObjectEmpty(requestData.data.params)){
                trail = `${trail} p${JSON.stringify(requestData.data.params)}`;
            }
            if(requestData.data.query && !this.isObjectEmpty(requestData.data.query)){
                trail = `${trail} q${JSON.stringify(requestData.data.query)}`;
            }
        }
        if(requestData.userId){
            trail = `${trail} (user: ${requestData.userId})`;
        }
        this.logger.info(trail);
    }

    private isObjectEmpty(obj: any){
        return Object.keys(obj).length === 0 && obj.constructor === Object;
    }

}