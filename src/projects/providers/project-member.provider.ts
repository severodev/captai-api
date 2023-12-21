import { Connection } from 'typeorm';
import { Project } from '../entity/project.entity';
import { ProjectMember } from '../entity/project-member.entity';

export const projectMemberProviders = [
  {
    provide: 'PROJECT_MEMBER_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(ProjectMember),
    inject: ['DATABASE_CONNECTION'],
  },
];