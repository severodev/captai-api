import { Controller, UseFilters } from '@nestjs/common';
import { AllExceptionsFilter } from '../../_filters/all-exceptions.filter';

@Controller('audit')
@UseFilters(AllExceptionsFilter)
export class AuditController {}
