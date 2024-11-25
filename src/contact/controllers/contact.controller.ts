import { Body, Controller, HttpCode, Post, UseFilters } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AllExceptionsFilter } from 'src/_filters/all-exceptions.filter';
import { ContactDto } from '../interfaces/contact.dto';
import { EmailService } from 'src/email/email.service';

@ApiTags('Contact')
@Controller('contact')
@UseFilters(AllExceptionsFilter)
export class ContactController {

    constructor(
        private readonly emailService: EmailService) { }

    @ApiOperation({
        summary: 'Submit a contact form',
        description: 'This endpoint allows users to submit a contact form with their name, email, and message.',
    })
    @ApiResponse({
        status: 200,
        description: 'The contact form was successfully submitted.',
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid request payload. Make sure all required fields are properly filled.',
    })
    @ApiBody({
        description: 'The details of the contact form submission, including name, email, and message.',
        type: ContactDto,
    })
    @Post()
    @HttpCode(200)
    async submitContactForm(@Body() contactDto: ContactDto): Promise<void> {
        await this.emailService.sendContactEmail(contactDto);
    }
}
