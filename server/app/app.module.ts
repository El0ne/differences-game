import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GameCardModule } from 'game-card/schemas/game-card.module';
import { GameClickController } from './controllers/game-click/game-click.controller';
import { DataBaseService } from './services/data-base/data-base.service';
import { DifferenceClickService } from './services/difference-click/difference-click.service';
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
        MongooseModule.forFeature([]),
        GameCardModule,
    ],
    controllers: [GameClickController],
    providers: [
        ChatGateway,
        Logger,
        DifferenceClickService,
        DataBaseService,
        DifferencesCounterService,
        PixelRadiusService,
        PixelPositionService,
        ImageDimensionsService,
    ],
})
export class AppModule {}
