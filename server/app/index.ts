import { AppModule } from '@app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ExampleController } from './controllers/example/example.controller';
import { DifferenceDetectionService } from './services/difference-detection/difference-detection.service';
import { ImageDimensionsService } from './services/image-dimensions/image-dimensions.service';
import { PixelPositionService } from './services/pixel-position/pixel-position/pixel-position.service';
import { PixelRadiusService } from './services/pixel-radius/pixel-radius.service';

const bootstrap = async () => {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe());
    app.enableCors();
    const config = new DocumentBuilder()
        .setTitle('Cadriciel Serveur')
        .setDescription('Serveur du projet de base pour le cours de LOG2990')
        .setVersion('1.0.0')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    SwaggerModule.setup('', app, document);
    await app.listen(process.env.PORT);
};

// TODO Comment and uncomment those lines
const imageService = new ImageDimensionsService();
const service = new DifferenceDetectionService(new PixelRadiusService(new PixelPositionService(imageService), imageService));
const controller = new ExampleController(service);
controller.exampleInfo();
// bootstrap();
