export interface ConnectionStatus {
    isConnected: boolean;
    connectionId?: string;
    lastActivity?: Date;
    reconnectAttempts?: number;
}
