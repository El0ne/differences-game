import { AppModule } from '@app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DataBaseService } from './services/data-base/data-base.service';

const bootstrap = async () => {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe());
    app.enableCors();
    const config = new DocumentBuilder()
        .setTitle('Cadriciel Serveur')
        .setDescription('Serveur du projet 2990 avec systeme de detection de difference')
        .setVersion('1.0.0')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    SwaggerModule.setup('', app, document);
    await app.listen(process.env.PORT);
    const dataBaseService: DataBaseService = new DataBaseService();
    try {
        await dataBaseService.start();
        console.log('Connection was successful');
    } catch {
        console.log('Connection was unsuccessful');
    }
};
bootstrap();
