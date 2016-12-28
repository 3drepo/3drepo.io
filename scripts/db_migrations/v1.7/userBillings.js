// moving billing info to billings : {}
// important to create an empty object for customData.billings = {} even if no billing info
// otherwise mongoose behaves incorrectly

db.getSiblingDB('admin').getCollection('system.users').find({}).forEach(function(user){


	if(!user.customData || user.customData.billings){
		//user migrated already
		return;
	}

	var updateAttrs = { 'customData.billings': {} };
	var removeAttrs = {	
		'customData.subscriptions': '',
		'customData.billingInfo': '',
		'customData.billingAgreementId': '',
		'customData.paypalPaymentToken': '',
		'customData.billingUser': '',
		'customData.lastAnniversaryDate': '',
		'customData.nextPaymentDate': '',
		'customData.firstNextPaymentDate':  '',
	};

	if(user.customData.subscriptions){
		updateAttrs['customData.billings'].subscriptions = user.customData.subscriptions;
	}

	if(user.customData.billingInfo){
		updateAttrs['customData.billings'].billingInfo = user.customData.billingInfo;
	}

	var nextPaymentDate = user.customData.nextPaymentDate || user.customData.firstNextPaymentDate;

	if(nextPaymentDate){
		updateAttrs['customData.billings'].nextPaymentDate = nextPaymentDate;
	}

	if(user.customData.billingAgreementId){
		updateAttrs['customData.billings'].billingAgreementId = user.customData.billingAgreementId;
	}

	if(user.customData.paypalPaymentToken){
		updateAttrs['customData.billings'].paypalPaymentToken = user.customData.paypalPaymentToken;
	}

	if(user.customData.billingUser){
		updateAttrs['customData.billings'].billingUser = user.customData.billingUser;
	}

	if(user.customData.lastAnniversaryDate){
		updateAttrs['customData.billings'].lastAnniversaryDate = user.customData.lastAnniversaryDate;
	}

	db.getSiblingDB('admin').getCollection('system.users').update({ _id: user._id }, {
		'$set': updateAttrs,
		'$unset': removeAttrs
	});

});
