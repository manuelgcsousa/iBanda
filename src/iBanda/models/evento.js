var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EventoSchema = new Schema({
	titulo:	          { type: String, required: true, unique: true },
	subtitulo:	      { type: String, required: true },
    data:             { type: String, required: true },
    descricao:        { type: String, required: true }
});

module.exports = mongoose.model('Evento', EventoSchema, 'eventos');