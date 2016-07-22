var subscriptions = [
	{
		plan: 'THE-100-QUID-PLAN',
		description: '3D Repo Advanced Licence',
		limits: {
			spaceLimit: 10737418240, //bytes
			collaboratorLimit: 1,
		},
		billingCycle: 1, //month
		freeTrial: 1, //month
		currency: 'GBP',
		amount: 100
	},

	{
		plan: 'BASIC',
		limits: {
			spaceLimit: 209715200, //bytes
			collaboratorLimit: 0,
		},
		billingCycle: -1, //month
		freeTrial: 0, //month
		currency: 'GBP',
		amount: 0
	}
];

function getSubscription(plan){
	return subscriptions.find(sub => sub.plan === plan);
}

function getBasicPlan(){
	return getSubscription('BASIC');
}

function getAll(){
	return subscriptions;
}

module.exports = {
	getAll,
	getSubscription,
	getBasicPlan
};