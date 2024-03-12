import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, IsEmail, IsBoolean } from "class-validator";

export class CreateUserDto {

    @IsString()
    @ApiProperty({ example: 'name', description: 'User last name for display purpose' })
    name: string;

    @IsString()
    @ApiProperty({ example: 'last name', description: 'User last name for display purpose' })
    lastName?: string; 

    @IsEmail()
    @ApiProperty({ example: 'exemple@domain.com', description: 'User email for notifications and login' })
    email: string;  

    @IsString()
    @ApiProperty({ example: '99999999999', description: 'User CPF or CNPJ' })
    cpfCnpj: string;

    @IsString()
    @ApiProperty({ example: 'asd90SDKMs23sda_12', description: 'User password' })
    password: string;
    
    @IsBoolean()
    @ApiProperty({ example: 'true', description: 'Veryfication' })
    acceptedTermsOfUse : boolean;

    @IsBoolean()
    @ApiProperty({ example: 'true', description: 'Veryfication' })
    acceptedPrivacyPolicy : boolean;

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