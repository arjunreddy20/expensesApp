const express = require('express');
const LeaderboardController = require('../controllers/leaderboardController');
const userAuthentication = require('../middleware/userAuthentication');
const router = express.Router();


router.get('/leaderboard', userAuthentication, LeaderboardController.getLeaderboard);

module.exports = router;