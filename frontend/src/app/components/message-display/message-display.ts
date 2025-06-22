import { Component, inject } from '@angular/core';
import { SignalrService } from '../../services/signalr';

@Component({
    selector: 'app-message-display',
    imports: [],
    templateUrl: './message-display.html',
    styleUrl: './message-display.scss',
})
export class MessageDisplay {
    private signalrService = inject(SignalrService);
    public messages = this.signalrService.messages;
}
