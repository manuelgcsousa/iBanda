var express = require('express');
var fs = require('fs');
var path = require('path');
var axios = require('axios');
var jwt = require('jsonwebtoken');
var decode = require('jwt-decode');
var Noticia = require('../controllers/noticia');
var Evento = require('../controllers/evento');
var router = express.Router();

/* GET página principal Admin. */
router.get('/', function(req, res, next) {
    if (req.session.token) {
        jwt.verify(req.session.token, 'ibanda', function(err, decoded) {
            if (!err && decoded.sub === "admin") {
                res.render('admin-menu');
            } else {
                res.redirect('/');
            }
        });
    } else {
        res.redirect('/');
    }
});

/* GET administração dos users. */
router.get('/users', function(req, res, next) {
    if (req.session.token) {
        jwt.verify(req.session.token, 'ibanda', function(err, decoded) {
            if (!err && decoded.sub === "admin") {
                axios.get('http://localhost:2727/api/admin/users', { headers: { "Authorization" : req.session.token } })
                    .then(users => res.render('admin-users', { users: users.data }))
                    .catch(erro => {
                        console.log('Erro na listagem de users: ' + erro);
                        res.render('error', { error: erro, message: "na listagem" });
                    });
            } else {
                res.redirect('/');
            }
        });
    } else {
        res.redirect('/');
    }
});

/* POST do formulário para chamamento de DELETE na API. */
router.post('/removeUser', function(req, res, next) {
    if (req.session.token) {
        jwt.verify(req.session.token, 'ibanda', function(err, decoded) {
            if (!err && decoded.sub === "admin") {
                axios.delete('http://localhost:2727/api/admin/removeUser', { headers: { "Authorization" : req.session.token } })
                    .then(users => res.redirect('/admin/users'))
                    .catch(erro => {
                        console.log('Erro ao remover user: ' + erro);
                        res.render('error', { error: erro, message: "na remoção" });
                    });
            } else {
                res.redirect('/');
            }
        });
    } else {
        res.redirect('/');
    }
});

/* POST do formulário para chamamento de PUT na API (Alteração do Username). */
router.post('/editUser', function(req, res, next) {
    if (req.session.token) {
        jwt.verify(req.session.token, 'ibanda', function(err, decoded) {
            if (!err && decoded.sub === "admin") {
                axios.put('http://localhost:2727/api/admin/editUser?user=' + req.body.username + '&newUser=' + req.body.new_username, { headers: { "Authorization" : req.session.token } })
                    .then(users => res.redirect('/admin/users'))
                    .catch(erro => {
                        console.log('Erro ao editar user: ' + erro);
                        res.render('error', { error: erro, message: "na edição" });
                    });
            } else {
                res.redirect('/');
            }
        });
    } else {
        res.redirect('/');
    }
});

/* POST do formulário para chamamento de PUT na API (Alteração da Password). */
router.post('/editPass', function(req, res, next) {
    if (req.session.token) {
        jwt.verify(req.session.token, 'ibanda', function(err, decoded) {
            if (!err && decoded.sub === "admin") {
                axios.put('http://localhost:2727/api/admin/editPass?user=' + req.body.username + '&newPass=' + req.body.new_password, { headers: {"Authorization" : req.session.token} }) // Forma NÃO segura.
                    .then(users => res.redirect('/admin/users'))
                    .catch(erro => {
                        console.log('Erro ao editar password: ' + erro);
                        res.render('error', { error: erro, message: "na edição" });
                    });
            } else {
                res.redirect('/');
            }
        });
    } else {
        res.redirect('/')
    }
});

/* GET lista de obras. */
router.get('/obras', function(req, res, next) {
    if (req.session.token) {
        jwt.verify(req.session.token, 'ibanda', function(err, decoded) {
            if (!err && decoded.sub === "admin") {
                fs.readFile('data/index.json', (erro, dados) => {
                    if (!erro) {
                        var indexObras = JSON.parse(dados);
                        res.render('admin-obras', { root: indexObras });
                    } else {
                        res.render('error', { error: erro, message: "Erro ao ler índice de obras" });
                    }
                });
            } else {
                res.redirect('/');
            }
        })
    } else {
        res.redirect('/');
    }
});

/* GET determinada obra. */
router.get('/obras/:id', function(req, res, next) {
    if (req.session.token) {
        jwt.verify(req.session.token, 'ibanda', function(err, decoded) {
            if (!err && decoded.sub === "admin") {
                axios.get('http://localhost:2727/api/admin/obras/' + req.params.id, { headers: {"Authorization" : req.session.token} })
                    .then(dados => res.render('admin-nav.pug', { marcha: dados.data[0] }))
                    .catch(erro => {
                        console.log('Erro ao obter obra: ' + erro);
                        res.render('error', { error: erro, message: "na obtenção" });
                    });
            } else {
                res.redirect('/');
            }
        });
    } else {
        res.redirect('/');
    }
});

/* Obtém uma partitura de determinado instrumento correspondente a uma obra. */
router.get('/obras/:id/inst/:inst/pdf/:pdf', function(req, res) {
    if (req.session.token) {
        jwt.verify(req.session.token, 'ibanda', function(err, decoded) {
            if (!err && decoded.sub === "admin") {
                const id = req.params.id;
                const inst = req.params.inst;
                const pdf = req.params.pdf;
                
                res.sendFile(path.join(__dirname, '../data/obras', id, '/instrumentos', inst, pdf));
            } else {
                res.redirect('/');
            }
        });
    } else {
        res.redirect('/');
    }
});

router.post('/removeObra', function(req, res) {
    if (req.session.token) {
        jwt.verify(req.session.token, 'ibanda', function(err, decoded) {
            if (!err && decoded.sub === "admin") {
                axios.delete('http://localhost:2727/api/admin/removeObra?id=' + req.body.id_obra, { headers: {"Authorization" : req.session.token} })
                    .then(users => res.redirect('/admin/obras'))
                    .catch(erro => {
                        console.log('Erro ao remover obra: ' + erro);
                        res.render('error', { error: erro, message: "na remoção" });
                    });
            } else {
                res.redirect('/');
            }
        });
    } else {
        res.redirect('/')
    }
});

/* GET administração de notícias. */
router.get('/noticias', function(req, res, next) {
    if (req.session.token) {
        jwt.verify(req.session.token, 'ibanda', function(err, decoded) {
            if (!err && decoded.sub === "admin") {
                axios.get('http://localhost:2727/api/admin/noticias', { headers: {"Authorization" : req.session.token} })
                    .then(dados => res.render('admin-noticias.pug', { noticias: dados.data }))
                    .catch(erro => {
                        console.log('Erro ao obter noticias: ' + erro);
                        res.render('error', { error: erro, message: "na obtenção" });
                    });
            } else {
                res.redirect('/');
            }
        });
    } else {
        res.redirect('/')
    }
});

/* POST do formulário para chamamento de POST na API (Inserção de notícia) */
router.post('/addNoticia', function(req, res, next) {
    if (req.session.token) {
        jwt.verify(req.session.token, 'ibanda', function(err, decoded){
            if (!err && decoded.sub === "admin") {
                Noticia.inserir(req.body)
                    .then(dados => res.redirect('/admin/noticias'))
                    .catch(erro => res.status(500).send('Erro na inserção da notícia: ' + erro));
            } else {
                res.redirect('/');
            }
        });
    } else {
        res.redirect('/');
    }
});

/* POST para alterar o estado da notícia */
router.post('/makeIndisponivel', function(req, res, next) {
    if (req.session.token) {
        jwt.verify(req.session.token, 'ibanda', function(err, decoded) {
            if (!err && decoded.sub === "admin") {
                Noticia.mudarEstado(req.body.titulo, req.body.disponibilidade)
                    .then(dados => res.redirect('/admin/noticias'))
                    .catch(erro => res.status(500).send('Erro na mudança de estado da notícia: ' + erro));
            } else {
                res.redirect('/');
            }
        });
    } else {
        res.redirect('/');
    }
});

/* POST para remover uma notícia */
router.post('/removeNoticia', function(req, res, next) {
    if (req.session.token) {
        jwt.verify(req.session.token, 'ibanda', function(err, decoded) {
            if (!err && decoded.sub === "admin") {
                Noticia.removeNoticia(req.body.titulo)
                    .then(dados => res.redirect('/admin/noticias'))
                    .catch(erro => res.status(500).send('Erro na mudança de estado da notícia: ' + erro));
            } else {
                res.redirect('/');
            }
        });
    } else {
        res.redirect('/');
    }
});

/* GET administração da agenda. */
router.get('/agenda', function(req, res, next) {
    if (req.session.token) { 
        jwt.verify(req.session.token, 'ibanda', function(err, decoded) {
            if (!err && decoded.sub === "admin") {
                axios.get('http://localhost:2727/api/admin/agenda', { headers: { "Authorization" : req.session.token } })
                    .then(dados => res.render('admin-agenda.pug', { eventos: dados.data }))
                    .catch(erro => {
                        console.log('Erro ao obter agenda: ' + erro);
                        res.render('error', { error: erro, message: "na obtenção" });
                    });
            } else {
                res.redirect('/');
            }
        });
    } else {
        res.redirect('/');
    }
});

/* POST do formulário para chamamento de POST na API (Inserção de evento) */
router.post('/addEvento', function(req, res, next) {
    if (req.session.token) {
        jwt.verify(req.session.token, 'ibanda', function(err, decoded) {
            if (!err && decoded.sub === "admin") {
                Evento.inserir(req.body)
                    .then(dados => res.redirect('/admin/agenda'))
                    .catch(erro => res.status(500).send('Erro na inserção da notícia: ' + erro));
            } else {
                res.redirect('/');
            }
        });
    } else {
        res.redirect('/');
    }
});

/* POST para remover um evento */
router.post('/removeEvento', function(req, res, next) {
    if (req.session.token) {
        jwt.verify(req.session.token, 'ibanda', function(err, decoded) {
            if (!err && decoded.sub === "admin") {
                Evento.removeEvento(req.body.titulo)
                    .then(dados => res.redirect('/admin/agenda'))
                    .catch(erro => res.status(500).send('Erro na mudança de estado da notícia: ' + erro));
            } else {
                res.redirect('/');
            }
        });
    } else {
        res.redirect('/');
    }
});

module.exports = router;
