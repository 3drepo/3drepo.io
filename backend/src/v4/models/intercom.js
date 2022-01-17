/**
 *  Copyright (C) 2020 3D Repo Ltd
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
const crypto = require("crypto");
const { intercom } = require("../config");
const { get } = require("lodash");
const axios = require("axios");
const accessToken = get(intercom, "accessToken");
const secretKey = get(intercom, "secretKey");
const config = require("../config");
const { v5Path } = require("../../interop");
const EventsV5 = require(`${v5Path}/services/eventsManager/eventsManager.constants`).events;
const EventsManager = require(`${v5Path}/services/eventsManager/eventsManager`);

const headers = {
	"Authorization": `Bearer ${accessToken}`,
	"Content-Type": "application/json"
};

const getEndpoint = (endpoint) => `https://api.intercom.io/${endpoint}`;

const Intercom = {};

Intercom.setIntercomHash = (userProfile) => {
	if (!secretKey) {
		return;
	}

	userProfile.intercomHash = crypto.createHmac("sha256", secretKey)
		.update(userProfile.email)
		.digest("hex");
};

Intercom.createContact = async (external_id, name, email, subscribed, company /* , job_title, phone_number, industry, found_us*/) => {
	if (!accessToken) {
		return;
	}

	const custom_attributes = {subscribed /* , job_title, industry, found_us*/ };
	if (company) {
		custom_attributes.company_entered = company;
	}

	// if (phone_number) {
	// 	custom_attributes.phone_number = phone_number;
	// }

	return await axios.post(getEndpoint("contacts"),
		{
			external_id,
			role: "user",
			email,
			name,
			custom_attributes
		}
		, { headers });

};

Intercom.submitLoginLockoutEvent = async (email) => {
	if (!accessToken) {
		return;
	}

	const created_at = Math.floor(Date.now() / 1000);

	return await axios.post(getEndpoint("events"),
		{
			event_name: "password-lockout",
			created_at,
			email
		}
		, { headers });
};

Intercom.subscribeToV5Events = () => {
	EventsManager.subscribe(EventsV5.FAILED_LOGIN_ATTEMPT, async ({email, failedLoginCount}) => {
		if (failedLoginCount >= config.loginPolicy.maxUnsuccessfulLoginAttempts) {
			try {
				await Intercom.submitLoginLockoutEvent(email);
			} catch (err) {
				// Do nothing
			}
		}
	});
};

module.exports = Intercom;
