var bcrypt = require('bcrypt');
var User = require('../models/user');

module.exports.listar = () => {
    return User
        .find()
        .exec();
}

module.exports.inserir = user => {
    return User.create(user);
}

module.exports.remove = user => {
    return User.deleteOne(user);
}

module.exports.editUsername = (oldUsername, newUsername) => {
    return User.updateOne({ username: oldUsername }, { username: newUsername });
}

module.exports.editPassword = (user, pass) => {
    var hash = bcrypt.hashSync(pass, 10);

    return User.updateOne({ username: user }, { password: hash });
}