const { getDB } = require("../config/mongodb");
const { v4: uuidv4 } = require('uuid'); 

const roomState = {};

module.exports = async function socketIO(io) {
    io.on('connection', (socket) => {
        socket.on('join-room',async (roomCode) => {
            socket.join(roomCode);
        
            const db = getDB();
            const room = await db.collection('rooms').findOne({roomCode: roomCode});
            if (!room) {
                socket.emit('error', 'Room not Found');
                return;
            }
            if (!roomState[roomCode]){
                roomState[roomCode] = {
                    tokens: room.tokenarray || [],
                    dirty: false
                };
            }
            socket.emit('room-state', { tokens: roomState[roomCode].tokens, mapUrl: room.map });

            io.to(roomCode).emit('user-joined', socket.id);
            socket.emit('user-list', Array.from(io.sockets.adapter.rooms.get(roomCode)));
            
            socket.on('token-moved', (data) => {
                if (!roomState[roomCode]) return;

                const token = roomState[roomCode].tokens.find(t => t._id === data.id);
                
                if (token) {
                    token.x = data.x;
                    token.y = data.y;
                    roomState[roomCode].dirty = true;
                }
                socket.to(roomCode).emit('token-moved', data);
            })

            socket.on('add-token', (data) => {
                if (!roomState[roomCode]) return;

                const newToken = {
                    _id: uuidv4(),
                    name: data.name,
                    color: data.color,
                    x: 0.5,
                    y: 0.5,
                    createdAt: new Date()
                };

                roomState[roomCode].tokens.push(newToken);
                roomState[roomCode].dirty = true;
                
                io.to(roomCode).emit('token-added', newToken);
            })

            socket.on('remove-token', (data) => {
                if (!roomState[roomCode]) return;

                roomState[roomCode].tokens = roomState[roomCode].tokens.filter(t => t._id !== data.id);
                roomState[roomCode].dirty = true;

                io.to(roomCode).emit('token-removed', data.id);
            });
            
            socket.on('disconnect', async () => {
                socket.leave(roomCode);

                socket.to(roomCode).emit('user-left', socket.id);
                const room = io.sockets.adapter.rooms.get(roomCode);

                if (!room || room.size === 0) {
                    if (roomState[roomCode]?.dirty) {
                        await db.collection('rooms').updateOne(
                            { roomCode },
                            { $set: { tokenarray: roomState[roomCode].tokens }}
                        );
                    }
                    delete roomState[roomCode];
                }
            });
        });
    });
    setInterval(async () => {
        const db = getDB();

        for (const roomCode in roomState) {
            if (!roomState[roomCode].dirty) continue;

            await db.collection('rooms').updateOne(
                { roomCode },
                { $set: { tokenarray: roomState[roomCode].tokens }}
            );
            roomState[roomCode].dirty = false;
        }
    }, 5000); //loads new token array to mongoDB every 5 seconds
}
