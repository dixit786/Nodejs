var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var myschema = new Schema({
    state_name: String
});

module.exports = mongoose.model('state', myschema);