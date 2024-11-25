import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  
  @Catch()
  export class AllExceptionsFilter implements ExceptionFilter {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    catch(exception: any, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const request = ctx.getRequest();
  
      const status =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;

      let error: string | object = { 
        message: exception.message,
        stack: exception.stack  
      };

      if (exception instanceof HttpException && status === HttpStatus.BAD_REQUEST) {
        const errorResponse = exception.getResponse();
        error = typeof errorResponse === 'string'
            ? errorResponse
            : (errorResponse as { message: string | string[] }).message || errorResponse;
      }

      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        url: request.url,
        error,
      });
    }
  }