var express = require('express');
var rimraf = require('rimraf');
var jsonfile = require('jsonfile');
var jwt = require('jsonwebtoken');
var decode = require('jwt-decode');
var User = require('../../controllers/user');
var Obras = require('../../controllers/obras');
var Noticia = require('../../controllers/noticia');
var Evento = require('../../controllers/evento');
var router = express.Router();


/* Obtém a lista de utilizadores. */
router.get('/users', function(req, res) {
    var token = req.headers.authorization;
    if (token) {
        jwt.verify(token, 'ibanda', function(err, decoded) {
            if (!err && decoded.sub === "admin") {
                User.listar()
                    .then(dados => res.jsonp(dados))
                    .catch(erro => res.status(500).send('Erro na listagem: ' + erro));
            } else {
                res.redirect('/');
            }
        });
    } else {
        res.redirect('/');
    }
});

/* Elimina um utilizador. */
router.delete('/removeUser', function(req, res) {
    var token = req.headers.authorization;
    if (token) {
        jwt.verify(token, 'ibanda', function(err, decoded) {
            if (!err && decoded.sub === "admin") {
                User.remove(req.body)
                    .then(dados => res.jsonp(dados))
                    .catch(erro => res.status(500).send('Erro na listagem: ' + erro));
            } else {
                res.redirect('/');
            }
        });
    } else {
        res.redirect('/');
    }
});

/* Altera username de um Utilizador */
router.put('/editUser', function(req, res) {
    var token = req.headers.authorization;
    if (token) {
        jwt.verify(token, 'ibanda', function(err, decoded) {
            if (!err && decoded.sub === "admin") {
                const oldUser = req.query.user;
                const newUser = req.query.newUser;
                
                User.editUsername(oldUser, newUser)
                    .then(dados => res.jsonp(dados))
                    .catch(erro => res.status(500).send('Erro na edição: ' + erro));
            } else {
                res.redirect('/');
            }
        });
    } else {
        res.redirect('/');
    }
});

/* Altera password de um Utilizador. */
router.put('/editPass', function(req, res) {
    var token = req.headers.authorization;
    if (token) {
        jwt.verify(token, 'ibanda', function(err, decoded) {
            if (!err && decoded.sub === "admin") {
                const user = req.query.user;
                const pass = req.query.newPass;
            
                User.editPassword(user, pass)
                    .then(dados => res.jsonp(dados))
                    .catch(erro => res.status(500).send('Erro na edição: ' + erro));
            } else {
                res.redirect('/');
            }
        });
    } else {
        res.redirect('/');
    }
});

/* Obtém uma obra com um determinado id. */
router.get('/obras/:id', function(req, res) {
    var token = req.headers.authorization;
    if (token) {
        jwt.verify(token, 'ibanda', function(err, decoded) {
            if (!err && decoded.sub === "admin") {
                const id = req.params.id;
                
                Obras.getObra(id)
                    .then(dados => res.jsonp(dados))
                    .catch(erro => console.log('Erro ao obter obra: ' + erro));
            } else {
                res.redirect('/');
            }
        });
    } else {
        res.redirect('/');
    }
});

/* Elimina uma obra. */
router.delete('/removeObra', function(req, res) {
    var token = req.headers.authorization;
    if (token) {
        jwt.verify(token, 'ibanda', function(err, decoded) {
            if (!err && decoded.sub === "admin") {
                const idObra = req.query.id;
            
                Obras.getObra(idObra)
                    .then(dadosObra => {
                        Obras.removeObra(idObra)
                            .then(dadosRemove => {
                                /* Remover pasta que contém as partituras. */
                                rimraf('./data/obras/' + idObra, () => { console.log('Pasta da obra \"$(id)\" libertada!'); });
            
                                /* Remover entrada no índice de obras. */
                                const tipo = dadosObra[0].tipo;

                                try {
                                    var indexObras = jsonfile.readFileSync('data/index.json');
                                    var marcha = indexObras.marchas[tipo]
                                        .filter(obj => { return obj['_id'] !== idObra }); // Se o array ficar vazio, não é eliminado do index.json.
            
                                    indexObras.marchas[tipo] = marcha;
            
                                    // Escreve novo JSON no ficheiro.
                                    jsonfile.writeFileSync('data/index.json', indexObras);
                                } catch (erroIndex) {
                                    console.log('Erro ao remover índice de obra: ' + erroIndex);
                                }
            
                                res.jsonp(dadosObra);
                            })
                            .catch(erro => console.log('Erro ao remover obra: ' + erro));
                    })
                    .catch(erro => console.log('Erro ao obter obra: ' + erro));
            } else {
                res.redirect('/');
            }
        });
    } else {
        res.redirect('/');
    }
});

/* Obtém a lista de notícias. */
router.get('/noticias', function(req, res) {
    var token = req.headers.authorization;
    if (token) {
        jwt.verify(token, 'ibanda', function(err, decoded) {
            if (!err && decoded.sub === "admin") {
                Noticia.listar()
                    .then(dados => res.jsonp(dados))
                    .catch(erro => res.status(500).send('Erro na listagem de notícias: ' + erro));
            } else {
                res.redirect('/');
            }
        });
    } else {
        res.redirect('/');
    }
});

/* Obtém a lista de notícias. */
router.get('/agenda', function(req, res) {
    var token = req.headers.authorization;
    if (token) {
        jwt.verify(token, 'ibanda', function(err, decoded) {
            if (!err && decoded.sub === "admin") {
                Evento.listar()
                    .then(dados => res.jsonp(dados))
                    .catch(erro => res.status(500).send('Erro na listagem de notícias: ' + erro));
            } else {
                res.redirect('/');
            }
        });
    } else {
        res.redirect('/');
    }
});

module.exports = router;