import { Component, inject } from '@angular/core';
import { ConnectionStatus } from './components/connection-status/connection-status';
import { MessageDisplay } from './components/message-display/message-display';
import { SignalrService } from './services/signalr';

@Component({
    selector: 'app-root',
    imports: [ConnectionStatus, MessageDisplay],
    templateUrl: './app.html',
    styleUrl: './app.scss',
})
export class App {
    title = 'SignalR + Angular 20';
    private signalrService = inject(SignalrService);

    async ngOnInit(): Promise<void> {
        try {
            // Inicia a conexão automaticamente quando a aplicação carrega
            await this.signalrService.startConnection();
            console.log('Aplicação iniciada e conectada ao SignalR');
        } catch (error) {
            console.error('Erro ao iniciar conexão:', error);
        }
    }

    async ngOnDestroy(): Promise<void> {
        try {
            await this.signalrService.stopConnection();
            console.log('Conexão encerrada');
        } catch (error) {
            console.error('Erro ao encerrar conexão:', error);
        }
    }
}
