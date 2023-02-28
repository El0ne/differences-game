import { StageController } from '@app/controllers/stage/stage.controller';
import { DifferenceClickService } from '@app/services/difference-click/difference-click.service';
import { DifferenceDetectionService } from '@app/services/difference-detection/difference-detection.service';
import { DifferencesCounterService } from '@app/services/differences-counter/differences-counter.service';
import { GameCardService } from '@app/services/game-card/game-card.service';
import { GameDifficultyService } from '@app/services/game-difficulty/game-difficulty.service';
import { ImageDimensionsService } from '@app/services/image-dimensions/image-dimensions.service';
import { ImageManagerService } from '@app/services/image-manager/image-manager.service';
import { PixelPositionService } from '@app/services/pixel-position/pixel-position/pixel-position.service';
import { PixelRadiusService } from '@app/services/pixel-radius/pixel-radius.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameCard, gameCardSchema } from './game-cards.schemas';

@Module({
    imports: [MongooseModule.forFeature([{ name: GameCard.name, schema: gameCardSchema }])],
    controllers: [StageController],
    providers: [
        GameCardService,
        GameDifficultyService,
        ImageDimensionsService,
        ImageManagerService,
        DifferenceDetectionService,
        PixelPositionService,
        DifferencesCounterService,
        PixelRadiusService,
        DifferenceClickService,
    ],
})
export class GameCardModule {}
