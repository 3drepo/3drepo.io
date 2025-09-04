/**
 *  Copyright (C) 2022 3D Repo Ltd
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

const axios = require('axios');

const WebRequests = {};

WebRequests.get = (uri, headers) => {
	const options = {};

	if (headers) {
		options.headers = headers;
	}

	return axios.get(uri, options);
};

WebRequests.delete = (uri, headers, payload) => {
	const options = {};

	if (headers) {
		options.headers = headers;
		options.data = payload;
	}

	return axios.delete(uri, options);
};

WebRequests.post = axios.post;
WebRequests.put = axios.put;
WebRequests.patch = axios.patch;

module.exports = WebRequests;
