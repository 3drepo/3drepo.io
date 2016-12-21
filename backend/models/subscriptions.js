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
	const responseCodes = require("../response_codes.js");

	let Subscriptions = function (billingUser, billingAddress, subscriptions) {
		this.billingUser = billingUser;
		this.subscriptions = subscriptions;
		this.billingAddress = billingAddress;
		this.now = new Date();
		this.currentPlanCount = {};

		//console.log('Subscriptions init --')
	};

	Subscriptions.prototype.addSubscription = function (plan) {
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

	Subscriptions.prototype.removeSubscription = function(plan){
		
		const User = require('./user');

		// plan.quantity negative means no. to remove, make it postive for removeNumber
		let removeNumber = -plan.quantity;
		let removeCount = 0;

		// Remove subscription with no assignedUser first
		let subs = this.getActiveSubscriptions({ excludeNotInAgreement: true })
			.filter(sub => sub.plan === plan.plan && !sub.assignedUser);

		for (let i = 0; i < subs.length && removeCount < removeNumber; i++) {
			subs[i].pendingDelete = true;
			removeCount++;
		}

		// continue the remove process if removeCount still smaller than the desired removeNumber
		// all unassigned licences have been removed previously, now looking for assigned licences to remove
		// but assigned licences can only be removed if assignedUser === this.customData.billingUser

		if (removeCount < removeNumber &&
			this.getActiveSubscriptions({ excludeNotInAgreement: true })
			.filter(sub => sub.plan === plan.plan)
			.length === removeNumber) {

			let subs = this.getActiveSubscriptions({ excludeNotInAgreement: true })
				.filter(sub => sub.plan === plan.plan && sub.assignedUser === this.customData.billingUser);

			for (let i = 0; i < subs.length && removeCount < removeNumber; i++) {
				subs[i].pendingDelete = true;
				removeCount++;
			}
		}


		if (removeCount < removeNumber) {
			// User try to remove licence with assigned user, reject it.
			return Promise.Reject(responseCodes.REMOVE_ASSIGNED_LICENCE);

		} else {

			// Get all the space limit remaining after removing the licences
			let quotaAfterDelete = this.getSubscriptionLimits({ excludePendingDelete: true });
			let totalSize = 0;

			console.log(quotaAfterDelete);
			return User.historyChunksStats(this.billingUser).then(stats => {
				
				if (stats) { 
					stats.forEach(stat => { totalSize += stat.size; });
				}
				// see if user have enough space to store their data after removing their licences
				// reject if they in fact dont have enough space after removing

				if (quotaAfterDelete.spaceLimit - totalSize < 0) {
					return Promise.reject(responseCodes.LICENCE_REMOVAL_SPACE_EXCEEDED);
				} else {
					return Promise.resolve();
				}
			});
		}


	};

	Subscriptions.prototype.removePendingDeleteSubscription = function(){

		// cannot use mongoosearray remove function anymore in subdoc schema, its not working
		// let ids = this.subscriptions.filter(sub => sub.pendingDelete).map(sub => sub._id);
		// ids.forEach(id => {
		// 	this.subscriptions.remove(id);
		// });

		for(let i=this.subscriptions.length - 1; i>=0; i--){
			let sub = this.subscriptions[i];
			if(sub.pendingDelete){
				this.subscriptions.splice(i, 1);
			}
		}
	}

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

	Subscriptions.prototype.getAllInAgreementSubscriptions = function () {

		return this.subscriptions.filter(sub => {
			let basicCond = sub.plan !== Subscription.getBasicPlan();
			let inCurrentAgreementCond =sub.inCurrentAgreement;

			return basicCond && inCurrentAgreementCond;
		});
	};

	Subscriptions.prototype.hasBoughtLicence = function () {
		return (this.getActiveSubscriptions({ skipBasic: true, excludeNotInAgreement: true })
			.length !== 0);
	};

	Subscriptions.prototype.changeSubscriptions = function (plans) {


		// Build up a list of expired subscriptions and remove them

		//cannot use mongoarray.remove because it is not working the subdocument's schema's method
		// let ids = this.subscriptions.filter(sub => !sub.active || (sub.expiredAt && sub.expiredAt < this.now))
		// 	.map(sub => sub._id);

		//console.log(ids);
		//ids.forEach(id => { this.subscriptions.remove(id); });

		for(let i = this.subscriptions.length - 1; i >= 0; i--){
			let sub = this.subscriptions[i];
			let expired = !sub.active || (sub.expiredAt && sub.expiredAt < this.now);

			if(expired){
				this.subscriptions.splice(i, 1);
			}
		}

		console.log('after remove', this.subscriptions.length);

		// Compute the current set of plans for the subscriptions
		this.getActiveSubscriptions({ skipBasic: true, excludeNotInAgreement: true })
			.forEach(subscription => {
				// Clean old flag
				subscription.pendingDelete = undefined;
				this.currentPlanCount[subscription.plan]  = (this.currentPlanCount[subscription.plan] + 1) || 1;
		});

		let changeInPlans = [];
		let hasChanges = false;

		console.log(this.currentPlanCount);

		// plans: [ { 'plan': 'ABC', 'quantity': 3 }]
		// currentPlanCount: { ABC: 1 }

		// Initialize to number of desired licences
		plans.forEach(plan => {
			changeInPlans.push({ plan: plan.plan, quantity: plan.quantity });
		});
		// changeInPlans: [ { 'plan': 'ABC', 'quantity': 3 }]

		// Calculate change in plans
		changeInPlans.forEach(plan => {
			if (this.currentPlanCount[plan.plan]) {
				plan.quantity -= this.currentPlanCount[plan.plan];
			}
		});
		// changeInPlans: [ { 'plan': 'ABC', 'quantity': 2 }]

		// Loop through the changes in the plans. If there is a change
		// update the subscription amounts.

		let addRemoveSubPromises = [];

		changeInPlans.forEach(plan => {
			// If a valid plan and has changed
			if (Subscription.getSubscription(plan.plan) && plan.quantity !== 0) {
				hasChanges = true;
				addRemoveSubPromises.push(
					(plan.quantity > 0) ? this.addSubscription(plan): this.removeSubscription(plan)
				);
			}
		});

		let proRataPeriodPlans = Object.keys(this.currentPlanCount).length > 0 ? changeInPlans.filter(plan => plan.quantity > 0) : [];
		let canceledAllPlans = plans.reduce((sum, plan) => sum + plan.quantity , 0)  === 0 && Object.keys(this.currentPlanCount).length === plans.length

		return Promise.all(addRemoveSubPromises).then(() => {
			return hasChanges ? { 
				proRataPeriodPlans: proRataPeriodPlans, 
				regularPeriodPlans: plans,
				canceledAllPlans: canceledAllPlans } : false
		});
	};

	Subscriptions.prototype.getSubscriptionLimits = function(options) {

		let subscriptions = this.getActiveSubscriptions(options);

		let sumLimits = {
			spaceLimit: 0, 
			collaboratorLimit: 0
		};

		//console.log(subscriptions);

		subscriptions.forEach(sub => {
			sumLimits.spaceLimit += sub.limits.spaceLimit;
			sumLimits.collaboratorLimit += sub.limits.collaboratorLimit;
		});

		return sumLimits;

	}

	Subscriptions.prototype.activateSubscriptions = function() {
		// Activate a created subscription

	};


	Subscriptions.prototype.renewSubscriptions = function(newDate, options) {
		// Activate or renew a created subscription
		options = options || {};

		let subscriptions = this.getAllInAgreementSubscriptions();
		console.log('renewSubscriptions', subscriptions);
		subscriptions.forEach(subscription => {
			if(!subscription.expiredAt || subscription.expiredAt < newDate){
				console.log('subscription', subscription);
				subscription.active = true;
				subscription.expiredAt = newDate;
				// assignLimits = true when executing agreement for 1st time, and thereafter they stick with the limits they have
				options.assignLimits && (subscription.limits = Subscription.getSubscription(subscription.plan).limits);
			}
		});
	};

	Subscriptions.prototype.assignFirstLicenceToBillingUser = function(){

		let subscriptions = this.getActiveSubscriptions({ skipBasic: true });

		if(!subscriptions.find(sub => sub.assignedUser === this.billingUser)){
			
			for(let i=0; i < subscriptions.length; i++){
				if(!subscriptions[i].assignedUser){
					subscriptions[i].assignedUser = this.billingUser;
					break;
				}
			}
		}
	}

	module.exports = Subscriptions;

})();