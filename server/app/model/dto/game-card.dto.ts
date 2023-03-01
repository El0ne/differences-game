import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class GameCardDto {
    @ApiProperty()
    @IsString()
    id: string;

    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsString()
    difficulty: string;

    @ApiProperty()
    @IsString()
    baseImage: string;

    @ApiProperty()
    @IsString()
    differenceImage: string;

    @ApiProperty()
    @IsNumber()
    radius: number;

    @ApiProperty()
    @IsNumber()
    differenceNumber: number;
}
