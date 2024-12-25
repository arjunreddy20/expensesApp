require('dotenv').config(); 
const { Sequelize } = require('sequelize');


const sequelize = new Sequelize(process.env.MY_DATABASE, process.env.MY_ROOT, process.env.MY_PASSWORD, {
    host: process.env.MY_HOST,
    dialect: 'mysql'
});

sequelize.authenticate()
.then(() => {
    console.log('Connection has been established successfully.');
    return sequelize.sync(); // Sync all models
})
.then(() => {
    console.log('Database & tables created!');
})
.catch(err => {
    console.error('Unable to connect to the database:', err);
});


module.exports = sequelize;