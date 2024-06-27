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

const { host } = require('../utils/config');

const { v4Path } = require('../../interop');
// eslint-disable-next-line import/no-dynamic-require, security/detect-non-literal-require, require-sort/require-sort
const { activityRecordIndex, createElasticRecord } = require(`${v4Path}/handler/elastic`);

const Elastic = {};

Elastic.createActivityRecord = (status, code, latency, contentLength, user, method, originalUrl) => {
	const timestamp = new Date();
	const id = `${host}-${user}-${timestamp.valueOf()}`;
	const elasticBody = {
		status: parseInt(status, 10),
		code,
		latency: parseInt(latency, 10),
		contentLength: parseInt(contentLength, 10),
		user,
		method,
		originalUrl,
		timestamp,
	};

	createElasticRecord(activityRecordIndex, elasticBody, id);
};

module.exports = Elastic;
