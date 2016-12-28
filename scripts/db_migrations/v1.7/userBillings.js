// moving billing info to billings : {}
// important to create an empty object for customData.billing = {} even if no billing info
// otherwise mongoose behaves incorrectly

db.getSiblingDB('admin').getCollection('system.users').find({}).forEach(function(user){


	if(!user.customData || user.customData.billing){
		//user migrated already
		return;
	}

	var updateAttrs = { 'customData.billing': {} };
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
		updateAttrs['customData.billing'].subscriptions = user.customData.subscriptions;
	}

	if(user.customData.billingInfo){
		updateAttrs['customData.billing'].billingInfo = user.customData.billingInfo;
	}

	var nextPaymentDate = user.customData.nextPaymentDate || user.customData.firstNextPaymentDate;

	if(nextPaymentDate){
		updateAttrs['customData.billing'].nextPaymentDate = nextPaymentDate;
	}

	if(user.customData.billingAgreementId){
		updateAttrs['customData.billing'].billingAgreementId = user.customData.billingAgreementId;
	}

	if(user.customData.paypalPaymentToken){
		updateAttrs['customData.billing'].paypalPaymentToken = user.customData.paypalPaymentToken;
	}

	if(user.customData.billingUser){
		updateAttrs['customData.billing'].billingUser = user.customData.billingUser;
	}

	if(user.customData.lastAnniversaryDate){
		updateAttrs['customData.billing'].lastAnniversaryDate = user.customData.lastAnniversaryDate;
	}

	db.getSiblingDB('admin').getCollection('system.users').update({ _id: user._id }, {
		'$set': updateAttrs,
		'$unset': removeAttrs
	});

});
