var express = require('express');
var formidable = require("formidable");
var Zip = require('adm-zip');
var fs = require('fs');
var fsExtra = require('fs-extra');
var jsonfile = require('jsonfile');
var rimraf = require('rimraf');
var libxml = require('libxmljs');
var parser = require('xml2json');
var jwt = require('jsonwebtoken');
var router = express.Router();


var Obras = require('../controllers/obras');
var pathIndex = 'data/index.json';

/* GET home page. */
router.get('/', function(req, res, next) {
    jwt.verify(req.session.token, 'ibanda', function(err, decoded) {
        if (err) {
            res.redirect('/');
        } else {
            res.render('ingest');
        }
    });
});

/* Enviado um ficheiro Zip. */
router.post('/processaForm', function(req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, (erro, fields, files) => {
        const fileName = files.ficheiro.name;
        var fenviado = files.ficheiro.path;
        var fnovo = './uploaded/' + fileName;

        if (fileName.includes('.zip')) {
            fs.rename(fenviado, fnovo, erro => {
                if (!erro) {
                    var obraObj = processUploadedFile(fnovo);
                    if (!obraObj) {
                        console.log('Erro: Objeto mal processado!');
                        /* 
                            Eliminar contéudo da pasta 'uploaded/'
                            => rm -rf para nodeJS. 
                            NOTA: Ter cuidado!
                        */
                        rimraf('./uploaded/*', () => { console.log('Pasta \"uploaded\" libertada!'); });

                        // Redireciona user para a página que lista as obras.
                        res.render('error', { error: erro, message: "Erro ao processar ficheiro" });     
                    } else {
                        /* 
                           Guardar registo da obra na base de dados e faz cópia das partituras.
                           São também eliminados o Zip previamente enviado ao servidor, bem como a pasta extraída.
                        */
                        Obras.inserirObra(obraObj)
                            .then(obraInserida => {
                                const id = obraInserida._id;
                                const source = './uploaded/extracted/pacote/';
                                const dest = './data/obras/';

                                try {
                                    // Função síncrona de forma a assegurar que a cópia é feita em primeiro lugar.
                                    fsExtra.copySync(source + 'instrumentos/', dest + id + '/instrumentos/');
                                    console.log('Partituras copiadas com sucesso!');
                                } catch(erroCopia) {
                                    console.log('Erro ao copiar partituras: ' + erroCopia);
                                }

                                /* Copia de forma síncrona o manifesto contido no ZIP para a pasta da obra no servidor. */
                                try {
                                    fsExtra.copySync(source + 'iBanda-SIP.xml', dest + id + '/iBanda-SIP.xml');
                                    console.log('Manifesto copiado com sucesso!');
                                } catch(erroCopia) {
                                    console.log('Erro ao copiar manifesto para a respetiva pasta da obra: ' + erroCopia);
                                }

                                /* Adiciona campos da obra ao índice das mesmas. */
                                try {
                                    var indexObras = jsonfile.readFileSync(pathIndex);
                                    if (indexObras.marchas[obraInserida.tipo]) {
                                        indexObras.marchas[obraInserida.tipo].push({
                                            "_id": id, 
                                            "titulo": obraInserida.titulo
                                        });
                                    } else {
                                        indexObras.marchas[obraInserida.tipo] = [];
                                        indexObras.marchas[obraInserida.tipo].push({
                                            "_id": id, 
                                            "titulo": obraInserida.titulo
                                        });
                                    }

                                    // Escreve novo JSON no ficheiro.
                                    jsonfile.writeFileSync(pathIndex, indexObras);
                                } catch (erroIndex) {
                                    console.log('Erro ao adicionar índice de obra: ' + erroIndex);
                                }

                                /* 
                                    Eliminar contéudo da pasta 'uploaded/'
                                    => rm -rf para nodeJS. 
                                    NOTA: Ter cuidado!
                                */
                                rimraf('./uploaded/*', () => { console.log('Pasta \"uploaded\" libertada!'); });

                                // Redireciona user para a página que lista as obras.
                                res.redirect('/');
                            })
                            .catch(erroInsere => console.log('Erro ao inserir obra: ' + erroInsere));
                    }
                } else {
                    console.log('Erro: ' + erro);
                    res.render('error', { error: erro, message: "Erro ao renomiar ficheiro enviado" });
                }
            });
        } else {
            console.log('Formato de ficheiro errado!');
            res.render('error', { error: erro, message: "Ficheiro enviado não é um ZIP!" });
        }
    });
});

function processUploadedFile(/* Nome do zip enviado */ fnovo) {
    const folderPath = 'uploaded/extracted/';

    var zip = new Zip(fnovo);
    zip.extractAllTo(folderPath, true);

    var files;
    files = fs.readdirSync(folderPath);
    if (files.includes('pacote')) {
        files = fs.readdirSync(folderPath + 'pacote');
        if (files.includes('instrumentos') && files.includes('iBanda-SIP.xml')) {
            const xml = folderPath + 'pacote/iBanda-SIP.xml';
            
            try {
                var xmlData = fs.readFileSync(xml, 'utf8');
                var xsdData = fs.readFileSync('../manifesto-SIP/iBanda-SIP.xsd', 'utf8');

                var xmlDoc = libxml.parseXmlString(xmlData);
                var xsdDoc = libxml.parseXmlString(xsdData);
            } catch(e) {
                console.log('Error: ', e.stack);
            }
            
            // Validação do manifesto.
            if (xmlDoc.validate(xsdDoc)) {
                const instPath = folderPath + 'pacote/instrumentos'; 

                // Conversão do manifesto para JSON (Objeto nativo Javascript).
                var xmlObj = JSON.parse(parser.toJson(xmlData));

                var obraObj = createObraObj(xmlObj, instPath);
                if (!obraObj) {
                    return null;
                } else {
                    return obraObj;
                }
            } else {
                console.log('Manifesto não é válido!');
            }
        } else {
            console.log('Pasta de \'instrumentos\' ou manifesto não existentes!');
        }
    } else {
        console.log('Não existe pacote!');
    }
}

function createObraObj(/* Manifesto em JSON */ xmlObj, /* Caminho para a pasta de instrumentos */ instPath) {

    // Criação da string que será o objeto obra.
    var metaInfo = xmlObj.manifesto.meta;
    var obraStr = '{\"titulo\":\"' + metaInfo.titulo + '\", \"tipo\":\"' + metaInfo.tipo + 
                  '\", \"compositor\":\"' + metaInfo.compositor;
    
    // Se existir campo 'arranjo'.
    if (metaInfo.arranjo) {
        obraStr += ('\", \"arranjo\":\"' + metaInfo.arranjo);
    }

    /* Tratamento da lista de instrumentos. */

    obraStr += '\", \"instrumentos\":';

    // Acesso ao campo 'instrumentos'. 
    var instrumentos = xmlObj.manifesto.instrumentos.inst;

    // Percorrer todos os instrumentos e verificar se as respetivas pastas existem.
    var folderInstrumentos = fs.readdirSync(instPath)
        .filter(e => { return e !== '.DS_Store'; }) // Remover ficheiro temporário macOS.

    var instrumentosArrStr = '[';
    for (let i = 0; i < instrumentos.length; i++) {
        var instrumento;

        if (folderInstrumentos.includes(instrumentos[i].nome)) {
            // Verificar se o nome do ficheiro no manifesto é igual ao da pasta.
            try {
                var ficheirosInst = fs.readdirSync(instPath + '/' + instrumentos[i].nome);

                if (ficheirosInst.includes(instrumentos[i].partitura)) {
                    instrumento = '{\"nome\":\"' + instrumentos[i].nome + 
                    '\", \"partitura\":\"' + instrumentos[i].partitura + '\"';

                    if (instrumentos[i].voz) {
                        instrumento += ', \"voz\":\"' + instrumentos[i].voz + '\"';
                    }

                    if (instrumentos[i].clave) {
                        instrumento += ', \"clave\":\"' + instrumentos[i].clave + '\"';
                    }

                    if (instrumentos[i].afinacao) {
                        instrumento += ', \"afinacao\":\"' + instrumentos[i].afinacao + '\"';
                    }

                    if (i < instrumentos.length - 1) {
                        instrumento += '},';
                    } else {
                        instrumento += '}';
                    }

                    // Concatenar objeto de instrumento criado com o array de instrumentos.
                    instrumentosArrStr += instrumento;
                } else {
                    console.log('Erro! Ficheiro com nome diferente no manifesto!');
                    return null;
                }
            } catch (erroLeituraPasta) {
                console.log('Erro ao ler pasta de instrumento: ' + erroLeituraPasta);
                return null;
            }
        } else {
            console.log('Erro! Pasta \'${instrumentos[i].nome}\' não existente...');
            return null;
        }
    }

    instrumentosArrStr += ']}';

    // Concatenar array de instrumentos com o objeto da obraStr.
    obraStr += instrumentosArrStr;

    return JSON.parse(obraStr);
}


module.exports = router;