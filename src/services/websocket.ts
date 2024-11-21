import WebSocket from 'ws';
import { WebSocketMessage, WebSocketClients, PendingMessage } from '../types/websocket.types';

const WS_PORT = 8080;
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 15000; // Increased to 15 seconds to give more time for ACK

// Initialize WebSocketClients
const wsClients: WebSocketClients = {
    clients: new Map<string, WebSocket>(),
    pendingMessages: []
};

export const setupWebSocket = () => {
    const wss = new WebSocket.Server({ port: WS_PORT });
    console.log(`WebSocket server started on port ${WS_PORT}`);

    wss.on('connection', (ws: WebSocket) => {
        const clientId = Math.random().toString(36).substring(7);
        wsClients.clients.set(clientId, ws);
        console.log(`New client connected: ${clientId}`);

        // Send client ID to the client
        const clientIdMessage: WebSocketMessage = {
            type: 'CLIENT_ID',
            clientId
        };
        ws.send(JSON.stringify(clientIdMessage));

        ws.on('message', (message: string) => {
            try {
                const data = JSON.parse(message) as WebSocketMessage;
                if (data.type === 'ACK' && data.messageId) {
                    console.log(`Received ACK for message: ${data.messageId}`);
                    removePendingMessage(data.messageId);
                }
            } catch (error) {
                console.error('Error processing message:', error);
            }
        });

        ws.on('close', () => {
            console.log(`Client disconnected: ${clientId}`);
            wsClients.clients.delete(clientId);
            // Clean up pending messages for disconnected client
            cleanupClientMessages(clientId);
        });
    });

    // Start retry mechanism
    startRetryMechanism();
};

const cleanupClientMessages = (clientId: string) => {
    wsClients.pendingMessages = wsClients.pendingMessages.filter(msg => {
        if (msg.clientId === clientId) {
            console.log(`Removing pending messages for disconnected client: ${clientId}`);
            return false;
        }
        return true;
    });
};

const isMessagePending = (messageId: string): boolean => {
    return wsClients.pendingMessages.some(msg => msg.message.messageId === messageId);
};

const startRetryMechanism = () => {
    setInterval(() => {
        const now = new Date();
        const messagesToRemove: string[] = [];

        wsClients.pendingMessages.forEach(message => {
            // Skip if message is already being processed for removal
            if (messagesToRemove.includes(message.message.messageId)) {
                return;
            }

            if (message.attempts >= MAX_RETRY_ATTEMPTS) {
                console.log(`Message ${message.message.messageId} exceeded max retry attempts`);
                messagesToRemove.push(message.message.messageId);
                return;
            }

            const timeSinceLastAttempt = now.getTime() - message.lastAttempt.getTime();
            if (timeSinceLastAttempt >= RETRY_DELAY) {
                const ws = wsClients.clients.get(message.clientId);
                if (ws && ws.readyState === WebSocket.OPEN) {
                    console.log(`Retry attempt ${message.attempts + 1} for message: ${message.message.messageId}`);
                    ws.send(JSON.stringify(message.message));
                    message.attempts++;
                    message.lastAttempt = now;
                } else {
                    console.log(`Client ${message.clientId} not connected, removing message ${message.message.messageId}`);
                    messagesToRemove.push(message.message.messageId);
                }
            }
        });

        // Remove messages that need to be removed
        messagesToRemove.forEach(messageId => {
            removePendingMessage(messageId);
        });
    }, 1000);
};

const removePendingMessage = (messageId: string) => {
    const index = wsClients.pendingMessages.findIndex(msg => msg.message.messageId === messageId);
    if (index !== -1) {
        console.log(`Removing pending message: ${messageId}`);
        wsClients.pendingMessages.splice(index, 1);
    }
};

export const sendMessageToClient = (clientId: string, message: any) => {
    const ws = wsClients.clients.get(clientId);
    const messageWithId: WebSocketMessage = {
        ...message,
        messageId: Math.random().toString(36).substring(7)
    };

    if (ws && ws.readyState === WebSocket.OPEN) {
        console.log(`Sending new message to client ${clientId}: ${messageWithId.messageId}`);
        
        // Don't send if a similar message is already pending
        const hasPendingSimilarMessage = wsClients.pendingMessages.some(
            msg => msg.clientId === clientId && 
            msg.message.type === messageWithId.type
        );

        if (!hasPendingSimilarMessage) {
            ws.send(JSON.stringify(messageWithId));
            const pendingMessage: PendingMessage = {
                clientId,
                message: messageWithId,
                attempts: 1,
                lastAttempt: new Date()
            };
            wsClients.pendingMessages.push(pendingMessage);
            console.log(`Added to pending messages. Current count: ${wsClients.pendingMessages.length}`);
        } else {
            console.log(`Similar message already pending for client ${clientId}`);
        }
    } else {
        console.log(`Client ${clientId} is not connected`);
    }
};