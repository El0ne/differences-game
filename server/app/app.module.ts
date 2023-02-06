import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { Course, courseSchema } from '@app/model/database/course';
import { GameCardService } from '@app/services/game-card/game-card.service';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GameClickController } from './controllers/game-click/game-click.controller';
import { StageController } from './controllers/stage/stage.controller';
import { DifferenceClickService } from './services/difference-click/difference-click.service';

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
    controllers: [StageController, GameClickController],
    providers: [ChatGateway, Logger, GameCardService, DifferenceClickService],
})
export class AppModule {}
