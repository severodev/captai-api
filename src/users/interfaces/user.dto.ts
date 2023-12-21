import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString } from "class-validator";
import { RoleDto } from "./../../roles/interfaces/role.dto";
import { ProfileDto } from "../../profiles/interfaces/profile.dto";

export class UserDto {

    @IsInt()
    @ApiProperty({ example: '1', description: 'User ID' })
    id: number;

    @IsString()
    @ApiProperty({ example: 'colab01523', description: 'New user login (username)' })
    username: string;

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

    @IsString()
    @ApiProperty({ example: 'pt-BR', description: 'User name' })
    fullname?: string;

}