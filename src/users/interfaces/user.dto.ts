import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsInt, IsString } from "class-validator";
import { RoleDto } from "./../../roles/interfaces/role.dto";
import { ProfileDto } from "../../profiles/interfaces/profile.dto";

export class UserDto {

    @IsInt()
    @ApiProperty({ example: '1', description: 'User ID' })
    id: number;

    @IsString()
    @ApiProperty({ example: 'Anderson', description: 'User last name for display purpose' })
    name: string;

    @IsString()
    @ApiProperty({ example: 'Severo', description: 'User last name for display purpose' })
    lastName?: string;

    @IsEmail()
    @ApiProperty({ example: 'exemple@domain.com', description: 'User email for notifications and login' })
    email: string;

    @ApiProperty({ type: RoleDto })
    role?: RoleDto;

    @ApiProperty({ type: ProfileDto })
    profile?: ProfileDto;

    @IsString()
    @ApiProperty({ example: '5', description: 'Collaborator ID - when new user is already registered as collaborator in the database' })
    collaborator?: number;

    @IsString()
    @ApiProperty({ example: 'pt-BR', description: 'User prefered language' })
    language?: number;
}