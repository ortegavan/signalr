import { Component } from '@angular/core';
import { MessageDisplay } from './components/message-display/message-display';

@Component({
    selector: 'app-root',
    imports: [MessageDisplay],
    templateUrl: './app.html',
    styleUrl: './app.scss',
})
export class App {
    title = 'SignalR + Angular 20';
}
