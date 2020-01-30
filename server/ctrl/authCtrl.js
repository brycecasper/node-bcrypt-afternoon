const bcrypt = require('bcryptjs');

module.exports = {
    register: async(req, res) => {
        const db = req.app.get('db');
        const {username, password, isAdmin} = req.body;

        let user = await db.get_user(username);
        if(user[0]){
            return res.status(400).send('User already exists');
        }

        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(password, salt);

        let registeredUser = await db.register_user(isAdmin, username, hash);
        req.session.user = registeredUser[0];
        res.status(201).send(req.session.user);
    },

    login: async(req, res) => {
        const db = req.app.get('db');
        const {username, password} = req.body;

        let user = await db.get_user(username);
        if(!user[0]){
            return res.status(400).send('Username not found');
        }

        let authenticated = bcrypt.compareSync(password, user[0].hash);
        if(!authenticated){
            return res.status(401).send('Password is incorrect');
        }

        req.session.user = {isAdmin: user.is_admin, id: user.id, username: user.username};
            return res.send(req.session.user);
    },

    logout: (req, res) => {
        req.session.destroy();
        return res.sendStatus(200);
    }
}