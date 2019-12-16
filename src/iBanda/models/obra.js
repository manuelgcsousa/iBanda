var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var InstrumentoSchema = new Schema({
	nome: 	   { type: String, required: true },
	partitura: { type: String, required: true },
	voz:	   { type: String, required: false },
	clave:     { type: String, required: false },
	afinacao:  { type: String, required: false }
});

var ObraSchema = new Schema({
	titulo:	      { type: String, required: true },
	tipo:	      { type: String, required: true },
    compositor:   { type: String, required: true },
    arranjo:      { type: String, required: false },
	instrumentos: [ InstrumentoSchema ]
});

module.exports = mongoose.model('Obra', ObraSchema, 'obras');
