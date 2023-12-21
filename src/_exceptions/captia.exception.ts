import { HttpException, HttpStatus } from "@nestjs/common";

export class CaptIAException extends HttpException {

    constructor(message: string, fullDescription: string,
        controllerName: string, serviceName: string, method: string) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

}