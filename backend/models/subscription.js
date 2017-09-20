/**
 *  Copyright (C) 2014 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";

const subscriptions = {
	"THE-100-QUID-PLAN" : {
		plan: "THE-100-QUID-PLAN",
		description: "Advanced Licence",
		limits: {
			spaceLimit: 10737418240, //bytes
			collaboratorLimit: 1,
		},
		billingCycle: 1, //month
		freeTrial: 1, //month
		currency: "GBP",
		amount: 100
	},
	"BASIC" : {
		plan: "BASIC",
		limits: {
			spaceLimit: 209715200, //bytes
			collaboratorLimit: 0,
		},
		billingCycle: -1, //month
		freeTrial: 0, //month
		currency: "GBP",
		amount: 0
	}
};

const subscriptionsArr = Object.keys(subscriptions).map( plan => {
	return subscriptions[plan];
});

function getSubscription(plan) {
	return subscriptions[plan];
}

function getBasicPlan() {
	return subscriptions["BASIC"];
}

function getAll() {
	return subscriptionsArr;
}

module.exports = {
	getAll,
	getSubscription,
	getBasicPlan
};
