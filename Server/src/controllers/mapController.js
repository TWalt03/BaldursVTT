const { getDB } = require("../config/mongodb");
const supabase = require('../config/supabase')
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
exports.upload = upload;

exports.mapController = async(req, res) => {
    const roomCode = req.params.roomCode;
    const fileName = `${roomCode}_${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const db = getDB();
    const io = req.app.get('io');
    
    const { error } = await supabase.storage
        .from('maps')
        .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype
        });
        //console.log(error);
        if (error) return res.status(500).json({error: 'Upload Failed'});
    const { data } = supabase.storage
        .from('maps')
        .getPublicUrl(fileName);

    const publicUrl = data.publicUrl;

    console.log('Updating room:', roomCode);
    const result = await db.collection('rooms').updateOne(
        { roomCode: roomCode },
        { $set: { map: publicUrl }}
    );
    console.log('Update result:', result);
    io.to(roomCode).emit('map-changed', publicUrl);
    

    res.json("Map Updated Succesfully");
}
