import { io } from 'socket.io-client';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
let socket;

export const getSocket = () => {
    if (socket) return socket;
    socket = io(apiUrl, {
        transports: ['websocket'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });
    return socket;
};

export const closeSocket = () => {
    if (socket) socket.disconnect();
    socket = null;
};
