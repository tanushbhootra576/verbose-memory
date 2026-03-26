import { io } from 'socket.io-client';

const apiUrl = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
let socket;

export const getSocket = () => {
    if (socket) return socket;
    // Allow polling fallback in case the host/load balancer blocks pure WebSocket upgrades
    socket = io(apiUrl, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });
    return socket;
};

export const closeSocket = () => {
    if (socket) socket.disconnect();
    socket = null;
};
