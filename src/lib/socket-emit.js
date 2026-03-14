import { io } from 'socket.io-client';

export function emitSocketEvent(event, payload) {
  try {
    const socket = io('http://localhost:3001');
    socket.on('connect', () => {
      socket.emit('broadcast', { event, payload });
      setTimeout(() => socket.disconnect(), 100);
    });
  } catch (error) {
    console.error('Socket emit error:', error);
  }
}
