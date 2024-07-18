import { Body, ClassSerializerInterceptor, Controller, Post, Req, UseFilters, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EmailService } from 'src/email/email.service';
import { AllExceptionsFilter } from '../../_filters/all-exceptions.filter';


@ApiTags('Email - Teste')
@Controller('email')
@UseFilters(AllExceptionsFilter)
@UseInterceptors(ClassSerializerInterceptor)
export class EmailTestController {

    constructor(
        private readonly emailService: EmailService,
    ) { }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Sends a test email' })
    @ApiResponse({ status: 200 })
    @Post()
    register(@Req() req: any, @Body() message: { to: string, subject: string, message: string }) {
        return this.emailService.sendTestMail(message.to, message.subject, message.message);
    }

}
