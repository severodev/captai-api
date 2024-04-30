import { Module } from '@nestjs/common';
import { segmentProviders } from './providers/segment.providers';
import { SegmentService } from './services/segment.service';
import { SegmentController } from './controllers/segment.controller';

@Module({
    providers: [
        ...segmentProviders,
        SegmentService,
    ],
    exports: [
        ...segmentProviders,
        SegmentService
    ],
    controllers: [SegmentController]
})
export class SegmentModule { }
