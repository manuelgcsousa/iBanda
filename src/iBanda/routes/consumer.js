var express = require('express');
var fs = require('fs');
var path = require('path');
var Zip = require('adm-zip');
var router = express.Router();

var Obras = require('../controllers/obras');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.send('Consumer em construção...');
});

/* Página com a lista de todas as obras no sistema. */
router.get('/obras', function(req, res, next) {
    fs.readFile('data/index.json', (erro, dados) => {
        if (!erro) {
            var indexObras = JSON.parse(dados);
            
            res.render('consumer-obras', { root: indexObras });
        } else {
            res.render('error', { error: erro, message: "Erro ao ler índice de obras" });
        }
    });
});

/* Fazer download de uma obra completa. */
router.get('/obras/download/:id', function(req, res, next) {
    const id = req.params.id;

    var zip = new Zip();
    zip.addLocalFile('data/obras/' + id + '/iBanda-SIP.xml');
    zip.addLocalFolder('data/obras/' + id + '/instrumentos', 'instrumentos');
    zip.writeZip('downloads/pacote.zip');

    res.download(path.join(__dirname, '../downloads/pacote.zip'));
});

/* Geração de um Website de consulta. */
router.get('/obras/nav/:id', function(req, res, next) {
    const id = req.params.id;
    
    Obras.getObra(id)
        .then(obraObj => { console.log(obraObj); res.render('obra-nav.pug', { marcha: obraObj[0] }); })
        .catch(erro => {
            console.log('Erro ao obter obra: ' + erro); 
            res.render('error', { error: erro, message: "Erro ao gerar website" }); 
        });
});

/* Obter um pdf de uma relativa obra. */
router.get('/obras/nav/:id/inst/:inst/pdf/:pdf', function(req, res, next) {
    const id = req.params.id;
    const inst = req.params.inst;
    const pdf = req.params.pdf;
    
    res.sendFile(path.join(__dirname, '../data/obras', id, '/instrumentos', inst, pdf));
});

module.exports = router;