var mongoose = require('mongoose');

var crushSchema = mongoose.Schema({

    user        : String,
    userId      : String,
    crush       : String,
    crushId     : String,
    matched     : Boolean

});

module.exports = mongoose.model('Crush', crushSchema);