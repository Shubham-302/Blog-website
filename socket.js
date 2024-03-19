const socketIO = require('socket.io');

function initSocket(server) {
  const io = socketIO(server);

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('newBlog', () => {
      // Emit event to the admin
      io.emit('newBlogNotification');
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
}

module.exports = initSocket;
