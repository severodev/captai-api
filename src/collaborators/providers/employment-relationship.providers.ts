import { Connection } from 'typeorm';
import { EmploymentRelationship } from '../entity/employment-relationship.entity';

export const employmentRelationshipProviders = [
  {
    provide: 'EMPLOYMENT_RELATIONSHIP_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(EmploymentRelationship),
    inject: ['DATABASE_CONNECTION'],
  },
];