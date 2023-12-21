import { Connection } from 'typeorm';
import { BudgetCategory } from '../entity/budget-category.entity';

export const budgetCategoryProviders = [
  {
    provide: 'BUDGET_CATEGORY_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(BudgetCategory),
    inject: ['DATABASE_CONNECTION'],
  },
];