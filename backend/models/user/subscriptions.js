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

		const Subscription = require("./subscription");
		const getSubscription = Subscription.getSubscription;
		const responseCodes = require("../response_codes.js");
		const ProjectSetting = require("./projectSetting");

		let Subscriptions = function (user) {
			let self = this instanceof Subscriptions ? this : Object.create(Subscriptions.prototype);

			self.user = user;
		};

		Subscriptions.prototype.createSubscription = function (plan, billingUser, active, expiredAt) {
			if (getSubscription(plan)) {

				this.customData.subscriptions = this.customData.subscriptions || [];
				let subscriptions = this.customData.subscriptions;

				let now = new Date();

				let subscription = {
					plan: plan,
					billingUser: billingUser,
					createdAt: now,
					updatedAt: now,
					active: active,
					expiredAt: expiredAt
				};

				if (active) {
					subscription.limits = getSubscription(subscription.plan)
						.limits;
				}

				subscriptions.push(subscription);

				return this.save()
					.then(() => {
						return Promise.resolve(subscription);
					});

			} else {

				return Promise.reject({ resCode: responseCodes.INVALID_SUBSCRIPTION_PLAN });
			}
		};

		Subscriptions.prototype.haveActiveSubscriptions = function () {
			return this.getActiveSubscriptions()
				.length > 0;
		};

		Subscriptions.prototype.getActiveSubscriptions = function (options) {
			let now = new Date();
			options = options || {};

			return this.customData.subscriptions.filter(sub => {

				let basicCond = true;
				if (options.skipBasic) {
					basicCond = sub.plan !== Subscription.getBasicPlan()
						.plan;
				}

				let pendingDeleteCond = true;
				if (options.excludePendingDelete) {
					pendingDeleteCond = !sub.pendingDelete;
				}

				let inCurrentAgreementCond = true;
				if (options.excludeNotInAgreement) {
					inCurrentAgreementCond = sub.inCurrentAgreement;
				}

				return basicCond && pendingDeleteCond && sub.active && (sub.expiredAt > now || !sub.expiredAt) && inCurrentAgreementCond;
			});

		};

		Subscriptions.prototype.getSubscriptionLimits = function (options) {
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

		Subscriptions.prototype.findSubscriptionByToken = function (billingUser, token) {
			let query = {
				"customData.subscriptions.token": token
			};

			let subscription;

			if (billingUser) {
				query["customData.subscriptions.billingUser"] = billingUser;
			}

			return this.findOne({ account: "admin" }, query, {
					"customData.subscriptions.$": 1,
					"user": 1
				})
				.then(dbUser => {

					subscription = dbUser.customData.subscriptions[0].toObject();
					subscription.account = dbUser.user;

					return Billing.findBySubscriptionToken(dbUser.user, subscription.token);

				})
				.then(payments => {

					subscription.payments = payments;
					return subscription;

				});
		};

		Subscriptions.prototype.removeAssignedSubscriptionFromUser = function (id, cascadeRemove) {
			let ProjectHelper = require("./helper/project");

			let subscription = this.customData.subscriptions.id(id);

			if (!subscription) {
				return Promise.reject({ resCode: responseCodes.SUBSCRIPTION_NOT_FOUND });
			}

			if (!subscription.assignedUser) {
				return Promise.reject({ resCode: responseCodes.SUBSCRIPTION_NOT_ASSIGNED });
			}

			if (subscription.assignedUser === this.user.user) {
				return Promise.reject({ resCode: responseCodes.SUBSCRIPTION_CANNOT_REMOVE_SELF });
			}

			//check if they are a collaborator
			return ProjectSetting.find({ account: this.user.user }, {})
				.then(projects => {

					let foundProjects = [];
					projects.forEach(project => {
						project.collaborators.forEach(collaborator => {
							if (collaborator.user === subscription.assignedUser) {
								foundProjects.push({ project: project._id, role: collaborator.role });
							}
						});
					});

					if (!cascadeRemove && foundProjects.length > 0) {
						return Promise.reject({ resCode: responseCodes.USER_IN_COLLABORATOR_LIST, info: { projects: foundProjects } });
					} else {

						let promises = [];
						foundProjects.forEach(foundProject => {
							promises.push(ProjectHelper.removeCollaborator(subscription.assignedUser, null, this.user, foundProject.project, foundProject.role));
						});

						return Promise.all(promises);

					}
				})
				.then(() => {
					subscription.assignedUser = undefined;
					return this.save()
						.then(() => subscription);
				});
		};

		Subscriptions.prototype.assignSubscriptionToUser = function (id) {
			let subscription = this.customData.subscriptions.id(id);

			if (!subscription) {
				return Promise.reject({ resCode: responseCodes.SUBSCRIPTION_NOT_FOUND });
			}

			let assigned;

			this.customData.subscriptions.forEach(subscription => {
				if (subscription.assignedUser === this.user.user) {
					assigned = true;
				}
			});

			if (assigned) {
				return Promise.reject({ resCode: responseCodes.USER_ALREADY_ASSIGNED });
			} else if (subscription.assignedUser) {
				return Promise.reject({ resCode: responseCodes.SUBSCRIPTION_ALREADY_ASSIGNED });
			} else {
				subscription.assignedUser = this.user.user;
				return this.save()
					.then(() => subscription);
			}
		};

		module.exports = function (user) {
			return new Subscriptions(user);
		};
	}
})();