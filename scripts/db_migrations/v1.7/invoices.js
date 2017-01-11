//convert fields in billings collection

var INV_PENDING = "pending";
var INV_COMPLETE = "complete";

db.adminCommand({listDatabases:1}).databases.forEach(function(database){
	db.getSiblingDB(database.name).getCollection('billings').find({}).forEach(function(invoice){
		var updateAttrs = {};

		if(invoice.pending){
			updateAttrs.state = INV_PENDING;
		} else {
			updateAttrs.state = INV_COMPLETE;
		}

		if(invoice.taxAmount){
			updateAttrs.taxAmount = parseFloat(invoice.taxAmount);
		}

		if(invoice.nextPaymentAmount){
			updateAttrs.nextPaymentAmount = parseFloat(invoice.nextPaymentAmount);
		}

		if(invoice.amount){
			updateAttrs.amount = parseFloat(invoice.amount);
		}

		var removeAttrs = { 'pending': ''};

		db.getSiblingDB(database.name).getCollection('billings').update({_id: invoice._id},{
			'$set': updateAttrs,
			'$unset': removeAttrs
		});

	});

});

// rename billings collection to invoices
db.adminCommand({listDatabases:1}).databases.forEach(function(database){
	db.getSiblingDB(database.name).getCollection('billings').renameCollection('invoices');
});

