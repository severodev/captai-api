export class UpdatePasswordDto {
    token?: string;
    email?: string;
    oldPassword?: string;
    newPassword: string;
}