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

const { codeExists, createResponseCode, templates } = require('../../../../../../../utils/responseCodes');
const Path = require('path');
const Yup = require('yup');
const YupHelper = require('../../../../../../../utils/helper/yup');
const { getContainers } = require('../../../../../../../models/modelSettings');
const { isTagUnique } = require('../../../../../../../models/revisions');
const { modelsExistInProject } = require('../../../../../../../models/projectSettings');
const { respond } = require('../../../../../../../utils/responder');
const { singleFileUpload } = require('../../../../../multer');
const { sufficientQuota } = require('../../../../../../../utils/quota');
const tz = require('countries-and-timezones');
const { validateMany } = require('../../../../../../common');

const Revisions = {};

const ACCEPTED_MODEL_EXT = [
	'.x', '.obj', '.3ds', '.md3', '.md2', '.ply',
	'.mdl', '.ase', '.hmp', '.smd', '.mdc', '.md5',
	'.stl', '.lxo', '.nff', '.raw', '.off', '.ac',
	'.bvh', '.irrmesh', '.irr', '.q3d', '.q3s', '.b3d',
	'.dae', '.ter', '.csm', '.3d', '.lws', '.xml', '.ogex',
	'.ms3d', '.cob', '.scn', '.blend', '.pk3', '.ndo',
	'.ifc', '.xgl', '.zgl', '.fbx', '.assbin', '.bim', '.dgn',
	'.rvt', '.rfa', '.spm', '.dwg', '.dxf', '.nwd',
];

Revisions.validateUpdateRevisionData = async (req, res, next) => {
	const schema = Yup.object().strict(true).noUnknown().shape({
		void: Yup.bool('void must be of type boolean')
			.required()
			.strict(true),
	});

	try {
		await schema.validate(req.body);
		next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

const fileFilter = (req, file, cb) => {
	const { originalname } = file;
	const fileExt = Path.extname(originalname).toLowerCase();
	if (!ACCEPTED_MODEL_EXT.includes(fileExt)) {
		const err = createResponseCode(templates.unsupportedFileFormat, `${fileExt} is not a supported model format`);
		cb(err, false);
	} else {
		cb(null, true);
	}
};

const validateContainerRevisionUpload = async (req, res, next) => {
	const schemaBase = {
		tag: YupHelper.types.strings.code.test('tag-not-in-use',
			'Revision name is already used by an existing revision',
			(value) =>
				value === undefined || isTagUnique(req.params.teamspace,
					req.params.container, value)).required(),
		desc: YupHelper.types.strings.shortDescription,
		importAnimations: Yup.bool().default(true),
		timezone: Yup.string().test('valid-timezone',
			'The timezone provided is not valid',
			(value) =>
				value === undefined || !!tz.getTimezone(value)),
	};

	const schema = Yup.object().noUnknown().required().shape(schemaBase);

	try {
		req.body = await schema.validate(req.body);
		if (!req.file) throw createResponseCode(templates.invalidArguments, 'A file must be provided');
		if (!req.file.size) throw createResponseCode(templates.invalidArguments, 'File cannot be empty');
		const { teamspace } = req.params;
		await sufficientQuota(teamspace, req.file.size);

		await next();
	} catch (err) {
		if (err?.code && codeExists(err.code)) respond(req, res, err);
		else respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

const validateFederationRevisionUpload = async (req, res, next) => {
	const schemaBase = {
		containers: Yup.array().of(YupHelper.types.id).min(1).required()
			.test('containers-validation', 'Containers must exist within the same project', (value) => {
				const { teamspace, project } = req.params;
				return value?.length && modelsExistInProject(teamspace, project, value).catch(() =>
					false);
			})
			.test('containers-validation', 'IDs provided cannot be of type federation', async (value) => {
				if (value?.length) {
					const { teamspace } = req.params;
					const foundContainers = await getContainers(teamspace, value, { _id: 1 });
					return foundContainers?.length === value?.length;
				}
				return false;
			}),
	};

	const schema = Yup.object().noUnknown().required().shape(schemaBase);

	try {
		req.body = await schema.validate(req.body);
		await next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

Revisions.validateNewRevisionData = (isFederation) =>
	(isFederation ? validateFederationRevisionUpload
		: validateMany([singleFileUpload('file', fileFilter), validateContainerRevisionUpload]));

module.exports = Revisions;
