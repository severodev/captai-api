import { Connection } from 'typeorm';
import { Project } from '../entity/project.entity';

export const projectsProviders = [
  {
    provide: 'PROJECT_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(Project),
    inject: ['DATABASE_CONNECTION'],
  },
];