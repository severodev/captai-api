import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, IsEmail } from "class-validator";

export class CreateUserDto {

    @IsString()
    @ApiProperty({ example: 'colab01523', description: 'New user login (username)' })
    username: string;

    @IsString()
    @ApiProperty({ example: 'asd90SDKMs23sda_12', description: 'User password' })
    password: string;   
    
    @IsString()
    @ApiProperty({ example: 'Anderson Severo', description: 'User name for display purpose' })
    fullname?: string;   

    @IsEmail()
    @ApiProperty({ example: 'severo@dellead.com', description: 'User email for notifications' })
    email: string;   

    @IsNumber()
    @ApiProperty({ example: '1', description: 'Role ID' })
    role: number;

    @IsString()
    @ApiProperty({ example: 'ADMIN', description: 'Profile Key' })
    profile: string;

    @IsString()
    @ApiProperty({ example: '5', description: 'Collaborator ID - when new user is already registered as collaborator in the database' })
    collaborator?: number;

    @IsString()
    @ApiProperty({ example: 'pt_BR', description: 'User prefered language' })
    language?: string;
}