const express = require('express');
const router = express.Router();

const {getRoom} = require('../controllers/roomController');

router.get('/:roomCode', getRoom);

module.exports = router;