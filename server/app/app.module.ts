import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { Differences, differencesSchema } from '@app/schemas/differences.schemas';
import { GameCard, gameCardSchema } from '@app/schemas/game-cards.schemas';
import { GameCardService } from '@app/services/game-card/game-card.service';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GameClickController } from './controllers/game-click/game-click.controller';
import { GameConstantsController } from './controllers/game-constants/game-constants.controller';
import { GameHistoryController } from './controllers/game-history/game-history/game-history.controller';
import { StageController } from './controllers/stage/stage.controller';
import { MatchGateway } from './gateways/match/match/match.gateway';
import { StageWaitingRoomGateway } from './gateways/waitingRoom/stage-waiting-room.gateway';
import { GameHistory, gameHistorySchema } from './schemas/game-history';
import { BestTimesService } from './services/best-times/best-times.service';
import { DifferenceClickService } from './services/difference-click/difference-click.service';
import { DifferenceDetectionService } from './services/difference-detection/difference-detection.service';
import { DifferencesCounterService } from './services/differences-counter/differences-counter.service';
import { GameConstantService } from './services/game-constant/game-constant.service';
import { GameDifficultyService } from './services/game-difficulty/game-difficulty.service';
import { GameHistoryService } from './services/game-history/game-history.service';
import { GameManagerService } from './services/game-manager/game-manager.service';
import { ImageDimensionsService } from './services/image-dimensions/image-dimensions.service';
import { ImageManagerService } from './services/image-manager/image-manager.service';
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
        MongooseModule.forFeature([
            { name: Differences.name, schema: differencesSchema },
            { name: GameCard.name, schema: gameCardSchema },
            { name: GameHistory.name, schema: gameHistorySchema },
        ]),
    ],
    controllers: [GameClickController, StageController, GameConstantsController, GameHistoryController],
    providers: [
        ChatGateway,
        StageWaitingRoomGateway,
        Logger,
        GameCardService,
        GameDifficultyService,
        DifferenceClickService,
        DifferenceDetectionService,
        DifferencesCounterService,
        PixelRadiusService,
        PixelPositionService,
        ImageDimensionsService,
        ImageManagerService,
        GameManagerService,
        MatchGateway,
        GameConstantService,
        BestTimesService,
        GameHistoryService,
    ],
})
export class AppModule {}
