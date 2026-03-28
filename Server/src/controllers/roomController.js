const { getDB } = require("../config/mongodb");

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
