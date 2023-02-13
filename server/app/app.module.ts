import { StageController } from '@app/controllers/stage/stage.controller';
import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { GameCardService } from '@app/services/game-card/game-card.service';
import { GameDifficultyService } from '@app/services/game-difficulty/game-difficulty.service';
import { ImageDimensionsService } from '@app/services/image-dimensions/image-dimensions.service';
import { ImageManagerService } from '@app/services/image-manager/image-manager.service';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DifferenceDetectionService } from './services/difference-detection/difference-detection.service';
import { DifferencesCounterService } from './services/differences-counter/differences-counter.service';
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
        MongooseModule.forFeature([]),
    ],
    controllers: [StageController],
    providers: [
        ChatGateway,
        Logger,
        PixelPositionService,
        DifferenceDetectionService,
        DifferencesCounterService,
        PixelRadiusService,
        GameCardService,
        GameDifficultyService,
        ImageDimensionsService,
        ImageManagerService,
    ],
})
export class AppModule {}
