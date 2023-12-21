import { Controller, Get, UseFilters, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AllExceptionsFilter } from '../../_filters/all-exceptions.filter';
import { BudgetCategoryDto } from '../interfaces/budget-category.dto';
import { BudgetCategoryService } from '../services/budgetCategory.service';

@UseGuards(JwtAuthGuard)
@Controller('budgetcategory')
@UseFilters(AllExceptionsFilter)
export class BudgetCategoryController {

    constructor(private budgetCategoryService: BudgetCategoryService) { }

    @Get('dropdown')
    async dropdown(): Promise<BudgetCategoryDto[]> {
        return this.budgetCategoryService.dropdown();
    }

}
