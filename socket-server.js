const { Server } = require('socket.io');
const http = require('http');

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*", // Allow Next.js frontend to connect
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // When backend API wants to broadcast to clients
  // A simple way is to have the Next.js API route connect as a client
  // and emit events, which the socket server then broadcasts.
  socket.on('broadcast', (data) => {
    // data: { event: 'patientStatusUpdated', payload: { ... } }
    if (data.event && data.payload) {
      io.emit(data.event, data.payload);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
