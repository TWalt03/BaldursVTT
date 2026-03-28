const { getDB } = require("../config/mongodb");

//Room code generation
function generateRoomCode(length = 8){
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for(i = 0; i < length; i++){
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

//Create Room
exports.createRoom = async (res) => {
    try{
        const db = getDB();
        const rooms = db.collection("rooms");
        const roomCode = generateRoomCode();
        const newRoom = {
            roomCode,
            map: null,
            tokenarray: [],
        }

        await rooms.insertOne(newRoom);

        res.status(201).json(newRoom);
        
    }catch (err) {
    res.status(500).json({ error: err.message });
  }
}

//Get a room by roomCode
exports.getRoom = async (req, res) => {
  try {
    const db = getDB();
    const rooms = db.collection("rooms");

    const room = await rooms.findOne({ roomCode: req.params.roomCode });

    if(!room){
        return res.status(404).json({error: 'room not found'})
    }

    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
