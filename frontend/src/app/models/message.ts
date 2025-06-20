export interface Message {
    id: string;
    content: string;
    timestamp: Date;
    type: 'info' | 'warning' | 'success' | 'error';
}
