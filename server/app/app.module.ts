import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { Course, courseSchema } from '@app/model/database/course';
import { GameCardService } from '@app/services/game-card/game-card.service';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DifferenceDetectionService } from './services/difference-detection/difference-detection.service';
import { DifferencesCounterService } from './services/differences-counter/differences-counter.service';
import { ImageDimensionsService } from './services/image-dimensions/image-dimensions.service';
import { PixelPositionService } from './services/pixel-position/pixel-position/pixel-position.service';
import { PixelRadiusService } from './services/pixel-radius/pixel-radius.service';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                uri: config.get<string>('DATABASE_CONNECTION_STRING'), // Loaded from .env
            }),
        }),
        MongooseModule.forFeature([{ name: Course.name, schema: courseSchema }]),
    ],
    controllers: [],
    providers: [
        ChatGateway,
        Logger,
        PixelPositionService,
        ImageDimensionsService,
        DifferenceDetectionService,
        DifferencesCounterService,
        PixelRadiusService,
        GameCardService,
    ],
})
export class AppModule {}
