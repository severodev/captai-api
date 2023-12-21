import { Connection } from 'typeorm';
import { WorkplanItem } from '../entity/workplan-item.entity';

export const workplanItemProviders = [
  {
    provide: 'WORKPLAN_ITEM_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(WorkplanItem),
    inject: ['DATABASE_CONNECTION'],
  },
];