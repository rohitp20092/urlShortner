import WebSocket from 'ws';

export interface PendingMessage {
    clientId: string;
    message: any;
    attempts: number;
    lastAttempt: Date;
}

export interface WebSocketMessage {
    type: 'CLIENT_ID' | 'SHORTENED_URL' | 'ACK';
    messageId?: string;
    clientId?: string;
    data?: any;
}

export interface WebSocketClients {
    clients: Map<string, WebSocket>;
    pendingMessages: PendingMessage[];
}
