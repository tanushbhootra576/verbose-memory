import { useEffect, useRef } from 'react';
import { getSocket } from '../services/socket';

export const useSocket = (event, handler) => {
    const saved = useRef(handler);

    useEffect(() => { saved.current = handler; }, [handler]);

    useEffect(() => {
        const socket = getSocket();
        if (event && saved.current) {
            socket.on(event, (...args) => saved.current(...args));
        }
        return () => {
            if (event) socket.off(event);
        };
    }, [event]);
};
