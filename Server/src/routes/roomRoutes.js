const express = require('express');
const router = express.Router();

const { createRoom } = require('../controllers/roomController');
const { getRoom } = require('../controllers/roomController');

router.post('/', createRoom);
router.get('/:roomCode', getRoom);

module.exports = router;