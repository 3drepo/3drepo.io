/**
 *  Copyright (C) 2024 3D Repo Ltd
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

const { src } = require('./path');
const { parseSetCookie, generateCookieArray } = require('./services');

const { templates } = require(`${src}/utils/responseCodes`);
const { CSRF_HEADER } = require(`${src}/utils/sessions.constants`);
const { generateUUIDString } = require(`${src}/utils/helper/uuids`);

const { getUserInfoFromToken } = require(`${src}/services/sso/frontegg`);

class SessionTracker {
	constructor(agent) {
		this.agent = agent;
	}

	// We expect the user data to be the same format as the data returned by
	// generateUserCredentials in serviceHelper
	async login({ user: userId, basicData: { email } }, headers = {}) {
		const resp = await this.agent.get('/v5/authentication/authenticate?redirectUri=https://localhost:3200')
			.set(headers)
			.expect(templates.ok.status);

		this.extractSessionFromResponse(resp);

		const url = new URL(resp.body.link);
		const state = url.searchParams.get('state');
		const code = url.searchParams.get('code');

		getUserInfoFromToken.mockResolvedValueOnce({ userId, email, accounts: [], authAccount: 'abc' });

		const resp2 = await this.get(`/v5/authentication/authenticate-post?state=${state}&code=${code}`)
			.expect(302);

		const respLogin = await this.get('/v5/login');
	}

	extractSessionFromResponse(resp, fabricateCSRF) {
		this.cookies = parseSetCookie(resp.headers['set-cookie']);
		if (fabricateCSRF) {
			this.cookies.token = this.cookies.token ?? generateUUIDString();
		}
	}

	setAuthHeaders(action) {
		if (this.cookies.token) {
			return action.set(CSRF_HEADER, this.cookies.token)
				.set('Cookie', generateCookieArray(this.cookies));
		}
		return action.set('Cookie', generateCookieArray(this.cookies));
	}

	post(url) {
		return this.setAuthHeaders(this.agent.post(url));
	}

	get(url) {
		return this.setAuthHeaders(this.agent.get(url));
	}

	put(url) {
		return this.setAuthHeaders(this.agent.put(url));
	}

	patch(url) {
		return this.setAuthHeaders(this.agent.patch(url));
	}

	delete(url) {
		return this.setAuthHeaders(this.agent.delete(url));
	}
}

const createSessionTracker = (agent) => new SessionTracker(agent);

module.exports = createSessionTracker;
