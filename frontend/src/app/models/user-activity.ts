export interface UserActivity {
    type: 'connected' | 'disconnected' | 'joined' | 'left';
    message: string;
    timestamp: Date;
}
