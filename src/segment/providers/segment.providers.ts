import { Connection } from 'typeorm';
import { Segment } from '../entity/segment.entity';


export const segmentProviders = [
  {
    provide: 'SEGMENT_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(Segment),
    inject: ['DATABASE_CONNECTION'],
  },
];