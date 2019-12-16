var Noticia = require('../models/noticia');
const Noticias = module.exports;

/* Obtém todas as notícias na BD. */ 
Noticias.listar = function() {
    return Noticia
        .find()
        .exec();
}

Noticias.inserir = function(noticia) {
    return Noticia.create(noticia);
}

Noticias.mudarEstado = function(titulo, estado) {
    if (estado == 1) {
        estado = 0;
    } else {
        estado = 1;
    }

    return Noticia
        .updateOne({ titulo: titulo }, { disponibilidade: estado });
}

Noticias.removeNoticia = function(titulo) {
    return Noticia
        .deleteOne({ titulo: titulo });
}