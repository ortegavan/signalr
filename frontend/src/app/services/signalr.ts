import { Injectable, signal } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Message } from '../models/message';

@Injectable({
    providedIn: 'root',
})
export class SignalrService {
    private hubConnection: HubConnection | null = null;
    private readonly hubUrl = 'http://localhost:5268/messageHub';

    public messages = signal<Message[]>([]);

    constructor() {
        this.initializeConnection();
    }

    private initializeConnection(): void {
        this.hubConnection = new HubConnectionBuilder()
            .withUrl(this.hubUrl)
            .withAutomaticReconnect()
            .build();

        this.hubConnection.start();
        this.setupEventHandlers();
    }

    private setupEventHandlers(): void {
        if (!this.hubConnection) return;

        // Handler para mensagens recebidas
        this.hubConnection.on('ReceiveMessage', (message: Message) => {
            // Converte timestamp string para Date se necessário
            if (typeof message.timestamp === 'string') {
                message.timestamp = new Date(message.timestamp);
            }

            // Atualiza o signal de mensagens
            this.messages.update((messages) => [...messages, message]);
        });
    }
}
