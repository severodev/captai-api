import { Controller, UseFilters, UseGuards } from '@nestjs/common';
import { AllExceptionsFilter } from '../../_filters/all-exceptions.filter';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('filemanagement')
@UseFilters(AllExceptionsFilter)
export class FileManagementController {

}
