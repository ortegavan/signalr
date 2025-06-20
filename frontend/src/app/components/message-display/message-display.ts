import { DatePipe } from '@angular/common';
import {
    Component,
    computed,
    inject,
    OnDestroy,
    OnInit,
    signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UserActivity } from '../../models/user-activity';
import { SignalrService } from '../../services/signalr';

@Component({
    selector: 'app-message-display',
    imports: [DatePipe, FormsModule],
    templateUrl: './message-display.html',
    styleUrl: './message-display.scss',
})
export class MessageDisplay implements OnInit, OnDestroy {
    private signalrService = inject(SignalrService);
    private subscriptions: Subscription[] = [];

    // Signals para estado reativo
    public messages = computed(() => this.signalrService.messages());
    public userActivities = signal<UserActivity[]>([]);
    public autoScroll = signal(true);

    // Computed signals para estatísticas
    public totalMessages = computed(() => this.messages().length);
    public messagesByType = computed(() => {
        return this.messages().reduce(
            (acc, message) => {
                acc[message.type] = (acc[message.type] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>,
        );
    });

    ngOnInit(): void {
        // Subscreve às atividades de usuários
        const userActivitySub = this.signalrService.userActivity$.subscribe(
            (activity) => {
                this.userActivities.update((activities) => {
                    const newActivities = [...activities, activity];
                    // Mantém apenas as últimas 20 atividades
                    return newActivities.slice(-20);
                });
            },
        );

        // Subscreve às novas mensagens para auto-scroll
        const messageSub = this.signalrService.message$.subscribe(() => {
            if (this.autoScroll()) {
                this.scrollToBottom();
            }
        });

        this.subscriptions.push(userActivitySub, messageSub);
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }

    public clearMessages(): void {
        this.signalrService.clearMessages();
        this.userActivities.set([]);
    }

    public onAutoScrollChange(): void {
        if (this.autoScroll()) {
            this.scrollToBottom();
        }
    }

    public getTypeLabel(type: string): string {
        const labels: Record<string, string> = {
            info: 'Info',
            warning: 'Aviso',
            success: 'Sucesso',
            error: 'Erro',
        };
        return labels[type] || type;
    }

    private scrollToBottom(): void {
        setTimeout(() => {
            const container = document.querySelector('.messages-container');
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        }, 100);
    }
}
