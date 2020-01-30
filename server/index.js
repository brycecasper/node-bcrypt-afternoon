require('dotenv').config();
const express = require('express');
const session = require('express-session');
const massive = require('massive');
const {SERVER_PORT, SESSION_SECRET, CONNECTION_STRING} = process.env
const app = express();
const authCtrl = require('./ctrl/authCtrl');
const treasureCtrl = require('./ctrl/treasureCtrl');
const auth = require('./middleware/authMiddleware');

app.use(express.json());

app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: SESSION_SECRET,
    cookie: {maxAge: 1000 * 60 * 60}
}));

massive(CONNECTION_STRING)
.then(db => {
    app.set('db', db);
    console.log('db connected');
})

//ENDPOINTS
app.post('/auth/register', authCtrl.register);
app.post('/auth/login', authCtrl.login);
app.get('/auth/logout', authCtrl.logout);

app.get('/api/treasure/dragon', treasureCtrl.dragonTreasure);
app.get('/api/treasure/user', auth.usersOnly, treasureCtrl.getUserTreasure);
app.post('/api/treasure/user', auth.usersOnly, treasureCtrl.addUserTreasure);
app.get('/api/treasure/all', auth.usersOnly, auth.adminsOnly, treasureCtrl.getAllTreasure);

const port = SERVER_PORT;
app.listen(port, () => {
    console.log(`Server on ${port}`);
})