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

	Subscriptions.prototype.addSubscriptionByPlan = function (plan) {
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

	Subscriptions.prototype.addSubscription = function(plan, active, expiredAt){

		if(Subscription.getSubscription(plan)){

			let subscription = {

				plan: plan,
				createdAt: this.now,
				updatedAt: this.now,
				active: active,
				expiredAt: expiredAt
			};

			if(active){
				subscription.limits = Subscription.getSubscription(subscription.plan).limits;
			}

			this.subscriptions.push(subscription);

			return subscription;

		} else {

			throw responseCodes.INVALID_SUBSCRIPTION_PLAN;
		}
	};

	Subscriptions.prototype.removeSubscriptionByPlan = function(plan){
		
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
		// but assigned licences can only be removed if assignedUser === this.billingUser

		if (removeCount < removeNumber &&
			this.getActiveSubscriptions({ excludeNotInAgreement: true })
			.filter(sub => sub.plan === plan.plan)
			.length === removeNumber) {

			let subs = this.getActiveSubscriptions({ excludeNotInAgreement: true })
				.filter(sub => sub.plan === plan.plan && sub.assignedUser === this.billingUser);

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

			//console.log(quotaAfterDelete);
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
				sub.pendingDelete = undefined;
				sub.inCurrentAgreement = false;
			}
		}
	};

	Subscriptions.prototype.getActiveSubscriptions = function (options) {
		options = options || {};

		//console.log('act sub', this.subscriptions);
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
		return this.getBoughtLicenes().length !== 0;
	};

	Subscriptions.prototype.getBoughtLicenes = function(){
		return this.getActiveSubscriptions({ skipBasic: true, excludeNotInAgreement: true });
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

		//console.log('after remove', this.subscriptions.length);

		// Compute the current set of plans for the subscriptions
		this.getBoughtLicenes().forEach(subscription => {
				// Clean old flag
				subscription.pendingDelete = undefined;
				this.currentPlanCount[subscription.plan]  = (this.currentPlanCount[subscription.plan] + 1) || 1;
		});

		let changeInPlans = [];
		let hasChanges = false;

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
					(plan.quantity > 0) ? this.addSubscriptionByPlan(plan): this.removeSubscriptionByPlan(plan)
				);
			}
		});

		let proRataPeriodPlans = Object.keys(this.currentPlanCount).length > 0 ? changeInPlans.filter(plan => plan.quantity > 0) : [];
		let canceledAllPlans = plans.reduce((sum, plan) => sum + plan.quantity , 0)  === 0 && Object.keys(this.currentPlanCount).length === plans.length;

		return Promise.all(addRemoveSubPromises).then(() => {
			return hasChanges ? { 
				proRataPeriodPlans: proRataPeriodPlans, 
				regularPeriodPlans: plans,
				canceledAllPlans: canceledAllPlans } : false;
		});
	};

	Subscriptions.prototype.getSubscriptionLimits = function(options) {

		let subscriptions = this.getActiveSubscriptions(options);

		let sumLimits = {
			spaceLimit: 0, 
			collaboratorLimit: 0
		};

		subscriptions.forEach(sub => {
			sumLimits.spaceLimit += sub.limits.spaceLimit;
			sumLimits.collaboratorLimit += sub.limits.collaboratorLimit;
		});

		return sumLimits;

	};

	Subscriptions.prototype.activateSubscriptions = function() {
		// Activate a created subscription

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

	Subscriptions.prototype.assignFirstLicenceToBillingUser = function(){

		let subscriptions = this.getActiveSubscriptions({ skipBasic: true });

		//console.log('assignFirstLicenceToBillingUser');
		if(!subscriptions.find(sub => sub.assignedUser === this.billingUser)){
			
			for(let i=0; i < subscriptions.length; i++){
				if(!subscriptions[i].assignedUser){
					subscriptions[i].assignedUser = this.billingUser;
					break;
				}
			}
		}
	};

	Subscriptions.prototype.updateAssignDetail = function(id, data){

		let subscription = this.subscriptions.find(subscription => subscription.id.toString() === id);

		if(!subscription){
			return Promise.reject(responseCodes.SUBSCRIPTION_NOT_FOUND);
		}

		if(data.hasOwnProperty('job') && data.job!== '' && !this.user.customData.jobs.findById(data.job)){

			return Promise.reject(responseCodes.JOB_NOT_FOUND);

		} else {

			if(data.job){
				subscription.job = data.job;
			} else if (data.job === ''){
				subscription.job = undefined;
			}
		
		}

		return Promise.resolve(subscription);

	};

	Subscriptions.prototype.assignSubscriptionToUser = function(id, userData){
		
		const User = require("./user.js");

		// can use .id function until mongoose fix this problem https://github.com/Automattic/mongoose/pull/4862
		// let subscription = this.subscriptions.id(id);
		 let subscription = this.subscriptions.find(subscription => subscription.id.toString() === id);

		if(!subscription){
			return Promise.reject(responseCodes.SUBSCRIPTION_NOT_FOUND);
		}

		let findUser;

		if(userData.email){
			findUser = User.findByEmail(userData.email);
		} else {
			findUser = User.findByUserName(userData.user);
		}

		return findUser.then(user => {

			if(!user){
				return Promise.reject(responseCodes.USER_NOT_FOUND);
			}

			let assigned = this.subscriptions.find(sub => sub.assignedUser === user.user);

			if(assigned){
				return Promise.reject(responseCodes.USER_ALREADY_ASSIGNED);
			} else if(subscription.assignedUser){
				return Promise.reject(responseCodes.SUBSCRIPTION_ALREADY_ASSIGNED);
			} else if (userData.job && !this.user.customData.jobs.findById(userData.job)) {
				return Promise.reject(responseCodes.JOB_NOT_FOUND);
			} else {
				subscription.assignedUser = user.user;

				if(userData.job){
					subscription.job = userData.job;
				}

				return subscription;
			}

		});
	};

	Subscriptions.prototype.removeAssignedSubscriptionFromUser = function(id, account, cascadeRemove){

		// can use .id function until mongoose fix this problem https://github.com/Automattic/mongoose/pull/4862
		// let subscription = this.subscriptions.id(id);

		const Project = require('./project');

		let subscription = this.subscriptions.find(subscription => subscription.id.toString() === id);

		if(!subscription){
			return Promise.reject(responseCodes.SUBSCRIPTION_NOT_FOUND);
		}

		if(!subscription.assignedUser){
			return Promise.reject(responseCodes.SUBSCRIPTION_NOT_ASSIGNED);
		}

		if(subscription.assignedUser === account){
			return Promise.reject(responseCodes.SUBSCRIPTION_CANNOT_REMOVE_SELF);
		}


		let foundProjects;
		let foundModels;
		let teamspacePerm = this.user.customData.permissions.findByUser(subscription.assignedUser);

		//check if they have any permissions assigned
		return Project.find({ account }, { 'permissions.user':  subscription.assignedUser}).then(projects => {
			
			foundProjects = projects;
			return ModelSetting.find({ account: account }, { 'permissions.user': subscription.assignedUser});
		
		}).then(models => {

			foundModels = models;

			if(!cascadeRemove && (foundModels.length || foundProjects.length || teamspacePerm)){

				return Promise.reject({ 
					resCode: responseCodes.USER_IN_COLLABORATOR_LIST, 
					info: {
						models: foundModels.map(m => { return { model: m.name}; }),
						projects: foundProjects.map(p => p.name),
						teamspace: teamspacePerm
					}
				});

			} else {

				//remove all permissions assigned
				let removeTeamspacePermission = Promise.resolve();

				if(teamspacePerm){
					removeTeamspacePermission = this.user.customData.permissions.remove(subscription.assignedUser);
				}
				
				return Promise.all(
					[].concat(
						foundModels.map(model => 
							model.changePermissions(model.permissions.filter(p => p.user !== subscription.assignedUser))
						),
						foundProjects.map(project => 
							project.updateAttrs({ permissions: project.permissions.filter(p => p.user !== subscription.assignedUser) })
						),
						removeTeamspacePermission
					)
				);
			}

		}).then(() => {
			subscription.assignedUser = undefined;
			return subscription;
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

})();
