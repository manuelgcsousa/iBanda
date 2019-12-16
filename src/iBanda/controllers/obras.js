var Obra = require('../models/obra');
const Obras = module.exports;

/* Insere um registo de uma obra na coleção de obras. */ 
Obras.inserirObra = function(obraObj) {
    return Obra.create(obraObj);
}

/* Procura uma obra no sistema, pelo seu _id. */
Obras.getObra = function(id) {
    return Obra
        .find( { _id: id } )
        .exec();
}

/* Remove uma obra do sistema, pelo seu _id. */
Obras.removeObra = function(id) {
    return Obra
        .deleteOne( { _id: id } );
}
