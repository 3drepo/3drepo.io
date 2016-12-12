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

(() => {
	"use strict";

	const Subscription = require("./subscription.js");
	const Billing = require("./new_billing.js");
	const responseCodes = require("../response_codes.js");

	let Subscriptions = function (user, billingAddress, subscriptions) {
		this.user = user;
		this.subscriptions = subscriptions;
		this.billingAddress = billingAddress;
		this.now = new Date();
		this.currentPlanCount = {};

		let addSubscription = function (plan) {
			// Add subscription
			for (let i = 0; i < plan.quantity; i++) {
				this.subscriptions.push({
					plan: plan.plan,
					createdAt: this.now,
					updatedAt: this.now,
					inCurrentAgreement: true,
					active: false
				});
			}
		};

		let removeSubscription = function (plan) {
			// Find subscription and remove it
			let removeNumber = -plan.quantity;
			let removeCount = 0;

			let subs = this.getActiveSubscriptions({ excludeNotInAgreement: true })
				.filter(sub => sub.plan === plan.plan && !sub.assignedUser);
			for (let i = 0; i < subs.length && removeCount < removeNumber; i++) {
				subs[i].pendingDelete = true;
				removeCount++;
			}

			//allow to remove billingUser's licence if remove count = user's current no. of licences
			if (removeCount < removeNumber &&
				this.getActiveSubscriptionewLicencesns({ excludeNotInAgreement: true })
				.filter(sub => sub.plan === plan.plan)
				.length === removeNumber) {

				let subs = this.getActiveSubscriptions({ excludeNotInAgreement: true })
					.filter(sub => sub.plan === plan.plan && sub.assignedUser === this.customData.billingUser);
				for (let i = 0; i < subs.length && removeCount < removeNumber; i++) {
					subs[i].pendingDelete = true;
					removeCount++;
				}
			}

			// Check if they can remove licences
			let quotaAfterDelete = this.getSubscriptionLimits({ excludePendingDelete: true });
			let totalSize = 0;

			let check = new Promise((resolve, reject) => {
					if (removeCount < removeNumber) {
						reject(responseCodes.REMOVE_ASSIGNED_LICENCE);
					} else {
						resolve(User.historyChunksStats(this.user));
					}
				})
				.then(stats => {
					if (stats) { stats.forEach(stat => { totalSize += stat.size; }); }
				})
				.then(() => {
					if (quotaAfterDelete.spaceLimit - totalSize < 0) {
						return Promise.reject(responseCodes.LICENCE_REMOVAL_SPACE_EXCEEDED);
					} else {
						return Promise.resolve();
					}

				});
		};

		// Build up a list of expired subscriptions and remove them
		let ids = this.subscriptions.filter(sub => !sub.active || (sub.expiredAt && sub.expiredAt < this.now))
			.map(sub => sub._id);

		ids.forEach(id => { this.subscriptions.remove(id); });

		// Compute the current set of plans for the subscriptions
		this.getActiveSubscriptions({ skipBasic: true })
			.forEach(subscription => {
				// Clean old flag
				subscription.pendingDelete = undefined;
				this.currentPlanCount[subscription.plan]  = (this.currentPlanCount[subscription.plan] + 1) || 1;
		});	
	};

	Subscriptions.prototype.getActiveSubscriptions = function (options) {
		options = options || {};

		return this.subscriptions.filter(sub => {
			let basicCond = options.skipBasic ? sub.plan !== Subscription.getBasicPlan()
				.plan : true;
			let pendingDeleteCond = options.excludePendingDelete ? !sub.pendingDelete : true;
			let inCurrentAgreementCond = options.excludeNotInAgreement ? sub.inCurrentAgreement : true;

			return basicCond && pendingDeleteCond && sub.active && (sub.expiredAt > this.now || !sub.expiredAt) && inCurrentAgreementCond;
		});
	};

	Subscriptions.prototype.hasBoughtLicence = function () {
		return (this.getActiveSubscriptions({ skipBasic: "true", excludeNotInAgreement: true })
			.length === 0);
	};

	Subscriptions.prototype.changeSubscriptions = function (plans) {
		let changeInPlans = {};
		let hasChanges = false;

		// Initialize to number of desired licences
		plans.forEach(plan => {
			changeInPlans.push({ plan: plan.plan, quantity: plan.quantity });
		});

		// Calculate change in plans
		changeInPlans.forEach(plan => {
			if (this.currentPlanCount[plan.plan]) {
				changeInPlans[plan.plan] -= this.currentPlanCount[plan.plan];
			}
		});

		// Loop through the changes in the plans. If there is a change
		// update the subscription amounts.
		changeInPlans.forEach(plan => {
			// If a valid plan and has changed
			if (Subscription.getSubscription(plan.plan) && plan.quantity !== 0) {
				hasChanges = true;
				(changeInPlans.quantity > 0) ? this.addSubscription(plan): this.removeSubscription(plan);
			}
		});

		return Promise.resolve(hasChanges);
	};

	Subscriptions.prototype.renewSubscription = function () {
		// Renew subscription changing expiry date

	};

	Subscriptions.prototype.activateSubscription = function () {
		// Activate a created subscription

	};

	module.exports

})();