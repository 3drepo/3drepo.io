/**
 *  Copyright (C) 2021 3D Repo Ltd
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

const { createResponseCode, templates } = require('../../../../../../../utils/responseCodes');
const { isNumber, isString } = require('../../../../../../../utils/helper/typeCheck');
const Yup = require('yup');
const { respond } = require('../../../../../../../utils/responder');
const { stringToUUID } = require('../../../../../../../utils/helper/uuids');
const { types } = require('../../../../../../../utils/helper/yup');

const Groups = {};

const objectEntryValidator = Yup.object().shape({
	account: types.strings.username.required(),
	model: types.id.required(),
	shared_ids: Yup.array().of(types.id).min(1).optional(),
	ifc_guids: Yup.array().of(Yup.string().length(22)).min(1).optional(),
}).test(
	'Object item check',
	'Can only contain either ifc_guids or shared_ids',
	(value) => (value.shared_ids && !value.ifc_guids) || (!value.shared_ids && value.ifc_guids),
);

const operators = {
	IS_EMPTY: 0,
	IS_NOT_EMPTY: 0,
	IS: 1,
	IS_NOT: 1,
	CONTAINS: 1,
	NOT_CONTAINS: 1,
	REGEX: 1,
	EQUALS: 1,
	NOT_EQUALS: 1,
	GT: 1,
	GTE: 1,
	LT: 1,
	LTE: 1,
	IN_RANGE: 2,
	NOT_IN_RANGE: 2,
};

const ruleParametersTypeCheck = (operator, values) => {
	switch (operator) {
	case 'IS':
	case 'IS_NOT':
	case 'CONTAINS':
	case 'NOT_CONTAINS':
	case 'REGEX':
		return values.every(isString);
	case 'EQUALS':
	case 'NOT_EQUALS':
	case 'GT':
	case 'GTE':
	case 'LT':
	case 'LTE':
		return values.every(isNumber);
	default:
		// range checks
		return values.length % 2 === 0 && values.every(isNumber);
	}
};

const ruleValidator = Yup.object().shape({
	field: Yup.string().required().min(1),
	operator: Yup.string().uppercase().oneOf(Object.keys(operators)).required(),
	values: Yup.array().of(Yup.string()).optional(),
}).strict(true).noUnknown()
	.test(
		'Rules validation', 'values field is not valid with the operator selected',
		(value) => {
			const nParams = operators[value.operator];
			const arrLength = (value.values || []).length;
			return (nParams === 0 && arrLength === 0)
					|| (nParams >= arrLength && ruleParametersTypeCheck(value.operator, value.values));
		},
	);

const checkGroupValid = (group, idRequired = true) => {
	const schema = Yup.object().shape({
		_id: idRequired ? types.id : types.id.required(),
		color: types.colorArr.required(),
		name: types.strings.title,
		author: types.strings.username.required(),
		createdAt: types.timestamp.required(),
		description: types.strings.blob.optional(),
		rules: Yup.array().of(ruleValidator).min(1).optional(),
		objects: Yup.array().of(objectEntryValidator).min(1).optional(),
		updatedAt: types.timestamp.optional().default(group.createdAt),
		updatedBy: types.strings.username.optional().default(group.author),
	}).strict(true).noUnknown()
		.required()
		.test(
			'Group validation',
			'Can only container either rules or objects',
			(value) => (value.rules && !value.objects) || (!value.rules && value.objects),
		);

	return schema.validate(group);
};

Groups.validateGroupsExportData = async (req, res, next) => {
	const schema = Yup.object().shape({
		groups: Yup.array('groups must be of type array')
			.of(types.id)
			.min(1, 'groups array must have at least 1 id')
			.strict(true)
			.required(),
	}).strict(true).noUnknown();

	try {
		const output = await schema.validate(req.body);
		output.groups = output.groups.map(stringToUUID);
		req.body = output;
		next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

Groups.validateGroupsImportData = async (req, res, next) => {
	try {
		const { groups } = req.body;
		await Promise.all(groups.map(checkGroupValid));
		for (let i = 0; i < groups.length; ++i) {
			const group = groups[i];
			group._id = stringToUUID(group._id);
			if (group.objects) {
				for (let j = 0; j < group.objects.length; ++j) {
					if (group.objects[j].shared_ids) {
						group.objects[j].shared_ids = group.objects[j].shared_ids.map(stringToUUID);
					}
				}
			}
		}

		next();
	} catch (err) {
		console.log('threw', err);
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

module.exports = Groups;
