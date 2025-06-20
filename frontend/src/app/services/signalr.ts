import { Injectable, signal } from '@angular/core';
import {
    HubConnection,
    HubConnectionBuilder,
    LogLevel,
} from '@microsoft/signalr';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Message } from '../models/message';
import { UserActivity } from '../models/user-activity';
import { ConnectionStatus } from '../models/connection-status';

@Injectable({
    providedIn: 'root',
})
export class SignalrService {
    private hubConnection: HubConnection | null = null;
    private readonly hubUrl = 'http://localhost:5268/messageHub';

    // Signals para estado reativo
    public connectionStatus = signal<ConnectionStatus>({ isConnected: false });
    public messages = signal<Message[]>([]);

    // Subjects para observables
    private messageSubject = new Subject<Message>();
    private userActivitySubject = new Subject<UserActivity>();
    private connectionStatusSubject = new BehaviorSubject<ConnectionStatus>({
        isConnected: false,
    });

    // Observables públicos
    public message$ = this.messageSubject.asObservable();
    public userActivity$ = this.userActivitySubject.asObservable();
    public connectionStatus$ = this.connectionStatusSubject.asObservable();

    constructor() {
        this.initializeConnection();
    }

    private initializeConnection(): void {
        this.hubConnection = new HubConnectionBuilder()
            .withUrl(this.hubUrl)
            .withAutomaticReconnect([0, 2000, 10000, 30000]) // Tentativas de reconexão
            .configureLogging(LogLevel.Information)
            .build();

        this.setupEventHandlers();
    }

    private setupEventHandlers(): void {
        if (!this.hubConnection) return;

        // Handler para mensagens recebidas
        this.hubConnection.on('ReceiveMessage', (message: Message) => {
            console.log('Mensagem recebida:', message);

            // Converte timestamp string para Date se necessário
            if (typeof message.timestamp === 'string') {
                message.timestamp = new Date(message.timestamp);
            }

            // Atualiza o signal de mensagens
            this.messages.update((messages) => [...messages, message]);

            // Emite para subscribers
            this.messageSubject.next(message);
        });

        // Handler para usuários conectados
        this.hubConnection.on('UserConnected', (message: string) => {
            const activity: UserActivity = {
                type: 'connected',
                message,
                timestamp: new Date(),
            };
            this.userActivitySubject.next(activity);
        });

        // Handler para usuários desconectados
        this.hubConnection.on('UserDisconnected', (message: string) => {
            const activity: UserActivity = {
                type: 'disconnected',
                message,
                timestamp: new Date(),
            };
            this.userActivitySubject.next(activity);
        });

        // Handler para entrada em grupos
        this.hubConnection.on('UserJoined', (message: string) => {
            const activity: UserActivity = {
                type: 'joined',
                message,
                timestamp: new Date(),
            };
            this.userActivitySubject.next(activity);
        });

        // Handler para saída de grupos
        this.hubConnection.on('UserLeft', (message: string) => {
            const activity: UserActivity = {
                type: 'left',
                message,
                timestamp: new Date(),
            };
            this.userActivitySubject.next(activity);
        });

        // Eventos de conexão
        this.hubConnection.onclose((error) => {
            console.log('Conexão fechada:', error);
            this.updateConnectionStatus(false);
        });

        this.hubConnection.onreconnecting((error) => {
            console.log('Tentando reconectar:', error);
            this.updateConnectionStatus(false, undefined, true);
        });

        this.hubConnection.onreconnected((connectionId) => {
            console.log('Reconectado com ID:', connectionId);
            this.updateConnectionStatus(true, connectionId);
        });
    }

    public async startConnection(): Promise<void> {
        if (!this.hubConnection) {
            this.initializeConnection();
        }

        try {
            if (this.hubConnection?.state === 'Disconnected') {
                await this.hubConnection.start();
                console.log('Conexão SignalR estabelecida');
                this.updateConnectionStatus(
                    true,
                    this.hubConnection.connectionId || undefined,
                );
            }
        } catch (error) {
            console.error('Erro ao conectar:', error);
            this.updateConnectionStatus(false);
            throw error;
        }
    }

    public async stopConnection(): Promise<void> {
        if (this.hubConnection) {
            await this.hubConnection.stop();
            console.log('Conexão SignalR encerrada');
            this.updateConnectionStatus(false);
        }
    }

    public async joinGroup(groupName: string): Promise<void> {
        if (this.hubConnection?.state === 'Connected') {
            try {
                await this.hubConnection.invoke('JoinGroup', groupName);
                console.log(`Entrou no grupo: ${groupName}`);
            } catch (error) {
                console.error('Erro ao entrar no grupo:', error);
                throw error;
            }
        }
    }

    public async leaveGroup(groupName: string): Promise<void> {
        if (this.hubConnection?.state === 'Connected') {
            try {
                await this.hubConnection.invoke('LeaveGroup', groupName);
                console.log(`Saiu do grupo: ${groupName}`);
            } catch (error) {
                console.error('Erro ao sair do grupo:', error);
                throw error;
            }
        }
    }

    public clearMessages(): void {
        this.messages.set([]);
    }

    public getConnectionState(): string {
        return this.hubConnection?.state || 'Disconnected';
    }

    private updateConnectionStatus(
        isConnected: boolean,
        connectionId?: string,
        isReconnecting: boolean = false,
    ): void {
        const status: ConnectionStatus = {
            isConnected,
            connectionId,
            lastActivity: new Date(),
            reconnectAttempts: isReconnecting
                ? (this.connectionStatus().reconnectAttempts || 0) + 1
                : 0,
        };

        this.connectionStatus.set(status);
        this.connectionStatusSubject.next(status);
    }

    // Método para cleanup quando o serviço for destruído
    public async ngOnDestroy(): Promise<void> {
        await this.stopConnection();
    }
}
