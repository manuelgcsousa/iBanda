var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NoticiaSchema = new Schema({
	titulo:	          { type: String, required: true, unique: true },
	subtitulo:	      { type: String, required: true },
    data:             { type: String, required: true },
    descricao:        { type: String, required: true },
    disponibilidade:  { type: Number, default: 1 }
});

module.exports = mongoose.model('Noticia', NoticiaSchema, 'noticias');