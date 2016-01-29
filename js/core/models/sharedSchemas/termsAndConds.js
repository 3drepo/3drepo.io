var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var keySchema = Schema({
	name: {type: String, required: true},
	datatype: {type: String, enum: ['string', 'boolean', 'date']},
	control: {type: String, enum: ['checkbox', 'text', 'textarea']}
});

var itemSchema = Schema({
	type: {type: String, enum: ['keyvalue', 'table']},
	keys: [ keySchema ],
	values: [Schema.Types.Mixed]
});

var blockSchema = Schema({
	block: {type: String, required: true},
	items : [ itemSchema ]
});

var termsAndConds = [blockSchema];
module.exports = termsAndConds;