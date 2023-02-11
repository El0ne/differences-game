import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class IdTransferService {
    idToTransfer: string;

    setIdFromGameCard(id: string): void {
        this.idToTransfer = id;
    }

    getId(): string {
        return this.idToTransfer;
    }
}
