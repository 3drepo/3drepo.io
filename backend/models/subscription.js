//TO-DO: we have only one plan now so it is hardcoded
var subscriptions = {
	'THE-100-QUID-PLAN': {
		plan: 'THE-100-QUID-PLAN',
		limits: {
			spaceLimit: 10737418240, //bytes
			collaboratorLimit: 5,
		},
		billingCycle: 1, //month
		freeTrial: 1, //month
		currency: 'GBP',
		amount: 100
	},

	'SOFT-LAUNCH-FREE-TRIAL': {
		plan: 'SOFT-LAUNCH-FREE-TRIAL',
		limits: {
			spaceLimit: 10737418240, //bytes
			collaboratorLimit:1,
		},
		billingCycle: 1, //month
		freeTrial: 0, //month
		currency: 'GBP',
		amount: 0
	}
};

function getSubscription(plan){
	return subscriptions[plan];
}

module.exports = {
	getSubscription
};