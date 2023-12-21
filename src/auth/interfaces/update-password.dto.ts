export class UpdatePasswordDto {
    token?: string;
    username?: string;
    oldPassword?: string;
    newPassword: string;
}