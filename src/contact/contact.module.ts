import { Module } from '@nestjs/common';
import { ContactController } from './controllers/contact.controller';
import { EmailService } from 'src/email/email.service';

@Module({
  providers: [EmailService],
  controllers: [ContactController]
})
export class ContactModule { }
