import { Inject, Injectable } from '@nestjs/common';
import { FindManyOptions, Repository } from 'typeorm';
import { BudgetCategory } from '../entity/budget-category.entity';
import { BudgetCategoryDto } from '../interfaces/budget-category.dto';

@Injectable()
export class BudgetCategoryService {

    constructor(
        @Inject('BUDGET_CATEGORY_REPOSITORY')
        private budgetCategoryRepository: Repository<BudgetCategory>,
    ) { }

    async findById(id: number): Promise<BudgetCategory> {
        return await this.budgetCategoryRepository.findOne(id);
    }

    async dropdown(): Promise<BudgetCategoryDto[]> {
        const filters: FindManyOptions<BudgetCategory> = {
            order: {
                order: "ASC"
            },
            where: {
                active: true
            }
        };
        return (await this.budgetCategoryRepository.find(filters))
            .map(p => <BudgetCategoryDto>{
                id: p.id,
                code: p.code,
                name: p.name
            });
    }    

}
