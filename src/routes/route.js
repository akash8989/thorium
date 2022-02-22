const express = require('express');
const router = express.Router();
const log=require('./logger')
router.get('/test-me', function (req, res) {
  log.printMessage()
    res.send('My first ever api!')
});

module.exports = router;