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

const { createResponseCode, templates } = require('../../../../utils/responseCodes');
const { getJobById, getJobs } = require('../../../../models/jobs');
const Yup = require('yup');
const { respond } = require('../../../../utils/responder');
const { types } = require('../../../../utils/helper/yup');
const { uniqueElements } = require('../../../../utils/helper/arrays');

const Jobs = {};

const validateJob = (isUpdate) => async (req, res, next) => {
	let schema = Yup.object().shape({
		name: (isUpdate ? types.strings.title : types.strings.title.required())
			.test('check-name-is-unique', 'Job with the same name already exists', async (value) => {
				try {
					if (!value) return true;

					const lowercaseValue = value.toLowerCase();
					const jobs = await getJobs(req.params.teamspace, { _id: 1, name: 1 });

					for (let i = 0; i < jobs.length; i++) {
						const jobName = jobs[i].name ?? jobs[i]._id;
						if (lowercaseValue === jobName.toLowerCase()) {
							return false;
						}
					}

					return true;
				} catch {
					return true;
				}
			}),
		users: Yup.array().of(types.strings.title)
			.test('users-uniqueness-check', 'users must be unique', (values) => {
				if (!values?.length) return true;
				return values.length === uniqueElements(values).length;
			}),
		color: Yup.string().matches(/^#[0-9A-Fa-f]{6}$/, 'color is not a valid RGB hex format'),
	}).strict(true).noUnknown();

	if (isUpdate) {
		schema = schema.test(
			'at-least-one-property',
			'You must provide at least one update value',
			(value) => Object.keys(value).length,
		);
	}

	try {
		await schema.validate(req.body);
		await next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

Jobs.validateNewJob = (req, res, next) => validateJob()(req, res, next);
Jobs.validateUpdateJob = (req, res, next) => validateJob(true)(req, res, next);

Jobs.jobExists = async (req, res, next) => {
	try {
		const { teamspace, job } = req.params;

		await getJobById(teamspace, job, { _id: 1 });
		await next();
	} catch (err) {
		respond(req, res, err);
	}
};

module.exports = Jobs;
