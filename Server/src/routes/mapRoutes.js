const express = require('express');
const router = express.Router();
const { upload, mapController } = require('../controllers/mapController');

router.post('/:roomCode', upload.single('map'), mapController);
router.get('/:mapURL', mapController );

module.exports = router;