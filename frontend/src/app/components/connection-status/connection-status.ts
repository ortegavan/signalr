import { Component, computed, inject } from '@angular/core';
import { SignalrService } from '../../services/signalr';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-connection-status',
    imports: [DatePipe],
    templateUrl: './connection-status.html',
    styleUrl: './connection-status.scss',
})
export class ConnectionStatus {
    private signalrService = inject(SignalrService);

    // Computed signals para estado reativo
    public connectionInfo = computed(() =>
        this.signalrService.connectionStatus(),
    );
    public isConnected = computed(() => this.connectionInfo().isConnected);

    public statusText = computed(() => {
        const status = this.connectionInfo();
        if (status.isConnected) return 'Conectado';
        if (status.reconnectAttempts && status.reconnectAttempts > 0)
            return 'Reconectando...';
        return 'Desconectado';
    });

    public statusClass = computed(() => {
        const status = this.connectionInfo();
        if (status.isConnected) return 'connected';
        if (status.reconnectAttempts && status.reconnectAttempts > 0)
            return 'connecting';
        return 'disconnected';
    });

    public async connect(): Promise<void> {
        try {
            await this.signalrService.startConnection();
        } catch (error) {
            console.error('Erro ao conectar:', error);
        }
    }

    public async disconnect(): Promise<void> {
        try {
            await this.signalrService.stopConnection();
        } catch (error) {
            console.error('Erro ao desconectar:', error);
        }
    }
}
