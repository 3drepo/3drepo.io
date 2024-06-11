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

const BillingAddress = require("./billingAddress");
const config = require("../config");
const {v5Path} = require("../../interop");
const TeamspaceModelV5 = require(`${v5Path}/models/teamspaceSettings`);
const { getQuotaInfo } = require(`${v5Path}/utils/quota`);

const UserBilling = {};

UserBilling.getSubscriptions = async (teamspace) => {
	const subscriptions = await TeamspaceModelV5.getSubscriptions(teamspace);
	return { basic: config.subscriptions.basic, ...subscriptions };
};

UserBilling.getSubscriptionLimits = async (teamspace) => {
	const { data, collaborators } = await getQuotaInfo(teamspace);

	return { spaceLimit: data / (1024 * 1024), collaboratorLimit: collaborators };
};

UserBilling.changeBillingAddress = async function(billing, billingAddress) {
	billing.billingInfo = await BillingAddress.changeBillingAddress(billing.billingInfo, billingAddress);
	return billing;
};

module.exports = UserBilling;
