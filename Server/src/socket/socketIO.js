module.exports = function socketIO(io) {
    io.on('connection', (socket) => {
        socket.on('join-room', (roomCode) => {
            socket.join(roomCode);
            io.to(roomCode).emit('user-joined', socket.id);
            socket.emit('user-list', Array.from(io.sockets.adapter.rooms.get(roomCode)));
            socket.on('disconnect', () => {
                socket.leave(roomCode);
                socket.to(roomCode).emit('user-left', socket.id);
            })
        })    
    })
}