/**
 *  Copyright (C) 2025 3D Repo Ltd
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

const { src } = require('../../v5/helper/path');

const { getUserByUsername, generateApiKey } = require(`${src}/models/users`);


class SessionTracker {
	constructor(agent) {
		this.agent = agent;
	}

	// This is a v4 workaround to keep the tests working after migrating users to frontegg...
	// Generate the API key on the user and append it in subsequent requests
	async login(user) {
		const  { customData }= await getUserByUsername(user, {"customData.apiKey" : 1 });

		if(customData?.apiKey)
			this.apiKey = customData.apiKey
		else
			this.apiKey = await generateApiKey(user);
	}

	setApiKey(url) {
		if(this.apiKey && !url.includes("key=")) {
			const keyword = url.includes("?") ? "&" : "?" ;
			return `${url}${keyword}key=${this.apiKey}`
		}
		return url;
	}

	post(url) {
		return this.agent.post(this.setApiKey(url));
	}

	get(url) {
		return this.agent.get(this.setApiKey(url));
	}

	put(url) {
		return this.agent.put(this.setApiKey(url));
	}

	patch(url) {
		return this.agent.patch(this.setApiKey(url));
	}

	delete(url) {
		return this.agent.delete(this.setApiKey(url));
	}
}

const createSessionTracker = (agent) => new SessionTracker(agent);

module.exports = createSessionTracker;
