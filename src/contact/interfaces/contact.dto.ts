import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ContactDto {
    @ApiProperty({
        description: 'The name of the person submitting the contact form.',
        example: 'John Doe',
    })
    @IsNotEmpty({ message: 'Name is required' })
    @MaxLength(100, { message: 'Name cannot be longer than 100 characters' })
    name: string;

    @ApiProperty({
        description: 'The email address of the person submitting the contact form.',
        example: 'johndoe@example.com',
        format: 'email',
    })
    @IsEmail({}, { message: 'Invalid email format' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @ApiProperty({
        description: 'The message provided by the person.',
        example: 'I need help with a subject.',
    })
    @IsNotEmpty({ message: 'Message is required' })
    @MaxLength(500, { message: 'Message cannot be longer than 500 characters' })
    message: string;
}
