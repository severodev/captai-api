import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, IsEmail } from "class-validator";

export class UpdateUserDto {

    @IsString()
    @ApiProperty({ example: 'user name', description: 'User last name for display purpose' })
    name: string;

    @IsString()
    @ApiProperty({ example: 'username', description: 'User last name for display purpose' })
    lastName?: string; 

    @IsEmail()
    @ApiProperty({ example: 'exemple@domain.com', description: 'User email for notifications and login' })
    email: string;   

    @IsNumber()
    @ApiProperty({ example: '1', description: 'Role ID' })
    role?: number;

    @IsString()
    @ApiProperty({ example: 'ADMIN', description: 'Profile Key' })
    profile?: string;

    @IsString()
    @ApiProperty({ example: '5', description: 'Collaborator ID - when new user is already registered as collaborator in the database' })
    collaborator?: number;

    @IsString()
    @ApiProperty({ example: 'pt_BR', description: 'User prefered language' })
    language?: string;
}