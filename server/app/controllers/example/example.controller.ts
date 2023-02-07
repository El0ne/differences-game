import { Message } from '@app/model/schema/message.schema';
import { DifferenceDetectionService } from '@app/services/difference-detection/difference-detection.service';
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Example')
@Controller('example')
export class ExampleController {
    // TODO replace service with ExampleService
    constructor(private readonly exampleService: DifferenceDetectionService) {}

    @Get('/')
    @ApiOkResponse({
        description: 'Return current time with hello world',
        type: Message,
    })
    async exampleInfo() {
        return await this.exampleService.compareImages('assets/images/image_12_diff.bmp', 'assets/images/image_empty.bmp', 5);
    }

    // TODO Uncomment all those lines
    // @ApiOkResponse({
    //     description: 'Return information about http api',
    //     type: Message,
    // })
    // @Get('/about')
    // about() {
    //     return this.exampleService.about();
    // }

    // @ApiCreatedResponse({
    //     description: 'Send a message',
    // })
    // @Post('/send')
    // send(@Body() requestBody: Message) {
    //     // HTTP_STATUS_CREATED will be automatically sent par NestJS
    //     this.exampleService.storeMessage(requestBody);
    // }

    // @ApiOkResponse({
    //     description: 'Return all messages',
    //     type: Message,
    //     isArray: true,
    // })
    // @Get('/all')
    // all() {
    //     return this.exampleService.getAllMessages();
    // }
}
