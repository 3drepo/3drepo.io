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

const Subscription = require("./subscription.js");
const responseCodes = require("../response_codes.js");
const ModelSetting = require("./modelSetting");
const mongoose = require("mongoose");


let Subscriptions = function (user, billingUser, billingAddress, subscriptions) {
	this.user = user;
	this.billingUser = billingUser;
	this.subscriptions = subscriptions;
	this.billingAddress = billingAddress;
	this.now = new Date();
	this.currentPlanCount = {};

	//console.log('Subscriptions init --')
};

Subscriptions.schema = mongoose.Schema({
	active: Boolean,
	updatedAt: Date,
	createdAt: Date,
	billingUser: String,
	assignedUser: String,
	job: String,
	expiredAt: Date,
	
	limits: {
		collaboratorLimit : {type: Number, default: 0},
		spaceLimit : {type: Number, default: 0}
	},

	plan: String,
	inCurrentAgreement: Boolean,
	pendingDelete: Boolean,
});


Subscriptions.prototype.addSubscription = function(plan, active, expiredAt){

	const sub = Subscription.getSubscription(plan);

	if(sub){

		const subscription = {
			plan: plan,
			createdAt: this.now,
			updatedAt: this.now,
			active: active,
			expiredAt: expiredAt
		};

		if(active){
			subscription.limits = sub.limits;
		}

		this.subscriptions.push(subscription);

		return subscription;

	} else {

		throw responseCodes.INVALID_SUBSCRIPTION_PLAN;
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
			sub.pendingDelete = undefined;
			sub.inCurrentAgreement = false;
		}
	}
};


Subscriptions.prototype.getAllInAgreementSubscriptions = function () {

	return this.subscriptions.filter(sub => {
		let basicCond = sub.plan !== Subscription.getBasicPlan();
		let inCurrentAgreementCond =sub.inCurrentAgreement;

		return basicCond && inCurrentAgreementCond;
	});
};


Subscriptions.prototype.renewSubscriptions = function(newDate, options) {
	// Activate or renew a created subscription
	options = options || {};

	let subscriptions = this.getAllInAgreementSubscriptions();
	//console.log('renewSubscriptions', subscriptions);
	subscriptions.forEach(subscription => {
		if(!subscription.expiredAt || subscription.expiredAt < newDate){
			//console.log('subscription', subscription);
			subscription.active = true;
			subscription.expiredAt = newDate;
			// assignLimits = true when executing agreement for 1st time, and thereafter they stick with the limits they have
			options.assignLimits && (subscription.limits = Subscription.getSubscription(subscription.plan).limits);
		}
	});
};

Subscriptions.prototype.findByID = function(id){
	return this.subscriptions.find(sub => sub.id === id);
};

Subscriptions.prototype.findByJob = function(job){
	return this.subscriptions.filter(sub => sub.job === job);
};

Subscriptions.prototype.findByAssignedUser = function(user){
	return this.subscriptions.find(sub => sub.assignedUser === user);
};

module.exports = Subscriptions;

