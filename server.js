require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const path = require('path');
const morgan = require('morgan');
const fs = require('fs');

const app = express();

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
 
app.use(morgan('combined', { stream: accessLogStream }));
app.use(cors());
app.use(bodyParser.json());
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', orderRoutes);
app.use('/api', leaderboardRoutes);



// Serve static files from the public folder
app.use(express.static(path.join(__dirname, './public')));

app.get('/password/resetpassword/:id', (req, res) => {
    res.sendFile(path.join(__dirname, './public/html/resetpassword.html'));
});

app.get('/insights', (req, res) => {
    res.sendFile(path.join(__dirname, './public/html/insights.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/html/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});