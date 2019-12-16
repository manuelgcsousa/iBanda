var express = require('express');
var jwt = require('jsonwebtoken')
var router = express.Router();
var Noticia = require('../controllers/noticia')
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    Noticia.listar()
        .then(dados => {
            if (req.session.token) {
                jwt.verify(req.session.token, 'ibanda', function(err, decoded) {
                    if (!err) {
                        if (decoded.sub === 'admin') {
                            res.render('index', { admin: true, noticias: dados });
                        } else {
                            res.render('index', { noticias: dados } );
                        }
                    } else {
                        res.render('index', { notLogged: true, noticias: dados });
                    }
                });
            } else {
                res.render('index', { notLogged: true, noticias: dados });
            }
        })
        .catch(erro => {
            console.log('Erro na listagem de notícias: ' + erro);
            res.render('error', { error: erro, message: 'Erro ao listar notícias' });
        });
});

/* GET about page. */
router.get('/about', function(req, res, next) {
    res.render('about');
});


module.exports = router;