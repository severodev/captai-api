import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsInt, IsString } from "class-validator";
import { RoleDto } from "./../../roles/interfaces/role.dto";
import { ProfileDto } from "../../profiles/interfaces/profile.dto";
import { Segment } from "src/segment/entity/segment.entity";
import { State } from "src/location/entity/state.entity";
import { Activite } from "src/activities/entity/Activite.entity";

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

    @ApiProperty({ example: '00000000000', description: '' })
    cpfCnpj?: number;

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
    @ApiProperty({ example: '661a9d9588c257da334ab957', description: 'User profile image ID' })
    profileImageId?: string;

    @IsString()
    @ApiProperty({ example: 'https://ik.imagekit.io/captirecursos24/captir/profile/default_profile_img_mAJF09ccs.jpg', description: 'User profile image URL' })
    profileImageUrl?: string;

    @ApiProperty({ type: Segment })
    segment?: Segment;

    @ApiProperty({ type: State })
    abrangency?: State[];

    @ApiProperty({ type: Activite })
    activite?: Activite[];
}