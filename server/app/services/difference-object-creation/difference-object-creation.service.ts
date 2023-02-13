/*
import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import { DifferenceDetectionService } from "../difference-detection/difference-detection.service";

const differenceDetectionService: DifferenceDetectionService;

@Injectable()
export class DifferenceObjectCreationService {

    createDifferenceObjects(firstImagePath: string, secondImagePath: string, radius: number): void {
        // passer en parametre les images a comparer ainsi que le rayon, puis retourner l'array de arrays de pixels differents
        const differencesArray = differenceDetectionService.compareImages(firstImagePath, secondImagePath, radius);
        
        // devra possiblement faire des requetes et reponses a la place (MongoDB possibilité?)
        for (let i = 0; i < differencesArray.length; i++) {
            const differenceObject: { [x: string]: any; }[typeof i] = this.createJSONFromArray(i, differencesArray[i]);
            fs.writeFile('../../dataBase/game-differences.json', JSON.stringify(differenceObject[i]), (err) => {
                if (err) {
                    console.log(err);
                }
            }
        }
    }

    // function that creates a JSON object from an array of arrays
    createJSONFromArray(differenceIndex: number, pixels: boolean[]): object {
        const differenceObject = {
            differenceIndex: differenceIndex,
            differencePixels: pixels,
        };
        return differenceObject;
    }
}
*/
