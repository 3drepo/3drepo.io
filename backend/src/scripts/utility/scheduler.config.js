/**
 *  Copyright (C) 2026 3D Repo Ltd
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

const Yup = require('yup');

const { v5Path } = require('../../interop');

const { isString } = require(`${v5Path}/utils/helper/typeCheck`);

const getSchema = (cmdList) => {
	const taskArrSchema = Yup.array().of(
		Yup.object({
			name: Yup.string().oneOf(cmdList).required(),
			params: Yup.array().of(Yup.mixed().nullable()).default([]),
		}),
	).default([]);

	return Yup.object({
		daily: taskArrSchema,
		weekly: taskArrSchema,
		monthly: taskArrSchema,
		emailOnFailure: Yup.boolean().default(true),
	});
};

const validateConfig = (conf, cmdList = []) => {
	// The additional parse is to work around the bug where the helm chart is writing the config as a serialised JSON string instead of JSON.
	const parsedConfig = isString(conf) ? JSON.parse(conf) : conf;
	return getSchema(cmdList).validate(parsedConfig);
};

module.exports = {
	validateConfig,
};
