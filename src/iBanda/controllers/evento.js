var Evento = require('../models/evento');
const Eventos = module.exports;

/* Obtém todas as notícias na BD. */ 
Eventos.listar = function() {
    return Evento
        .find()
        .exec();
}

Eventos.inserir = function(evento) {
    return Evento.create(evento);
}

Eventos.removeEvento = function(titulo) {
    return Evento
        .deleteOne({ titulo: titulo });
}
