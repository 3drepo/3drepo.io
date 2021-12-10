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
const Path = require('path');
const Yup = require('yup');
const YupHelper = require('../../../../../../../utils/helper/yup');
const { getContainers } = require('../../../../../../../models/modelSettings');
const { modelsExistInProject } = require('../../../../../../../models/projects');
const { respond } = require('../../../../../../../utils/responder');
const { singleFileUpload } = require('../../../../../multer');
const { sufficientQuota } = require('../../../../../../../utils/quota');
const { validateMany } = require('../../../../../../common');

const Revisions = {};

const ACCEPTED_MODEL_EXT = [
	'.x', '.obj', '.3ds', '.md3', '.md2', '.ply',
	'mdl', '.ase', '.hmp', '.smd', '.mdc', '.md5',
	'stl', '.lxo', '.nff', '.raw', '.off', '.ac',
	'bvh', '.irrmesh', '.irr', '.q3d', '.q3s', '.b3d',
	'dae', '.ter', '.csm', '.3d', '.lws', '.xml', '.ogex',
	'ms3d', '.cob', '.scn', '.blend', '.pk3', '.ndo',
	'ifc', '.xgl', '.zgl', '.fbx', '.assbin', '.bim', '.dgn',
	'rvt', '.rfa', '.spm', '.dwg', '.dxf',
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

const fileFilter = async (req, file, cb) => {
	try {
		const { originalname, size } = file;
		const { teamspace } = req.params;
		const fileExt = Path.extname(originalname);
		if (!ACCEPTED_MODEL_EXT.includes(fileExt)) {
			const err = createResponseCode(templates.unsupportedFileFormat, `${fileExt} is not a supported model format`);
			cb(err, false);
		} else {
			await sufficientQuota(teamspace, size);
			cb(null, true);
		}
	} catch (err) {
		cb(err, false);
	}
};

const validateRevisionUpload = (isFederation) => async (req, res, next) => {
	const schemaBase = {
		tag: YupHelper.types.strings.code,
		desc: YupHelper.types.strings.shortDescription,
	};

	if (isFederation) {
		schemaBase.containers = Yup.array().of(YupHelper.types.id).min(1).required()
			.test('containers-validation', 'Containers must exist within the same project', (value) => {
				const { teamspace, project } = req.params;
				return modelsExistInProject(teamspace, project, value).catch(() => false);
			})
			.test('containers-validation', 'IDs provided cannot be of type federation', async (value) => {
				const { teamspace } = req.params;
				const foundContainers = await getContainers(teamspace, value, { _id: 1 });
				return foundContainers?.length === value?.length;
			});
	} else {
		schemaBase.importAnimations = Yup.bool().default(true);
		schemaBase.tag = schemaBase.tag.required();
	}

	const schema = Yup.object().noUnknown().required()
		.shape(schemaBase);

	try {
		req.body = await schema.validate(req.body);
		if (!isFederation && !req.file) throw createResponseCode(templates.invalidArguments, 'A file must be provided');
		await next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

Revisions.validateNewRevisionData = (isFederation) => (isFederation ? validateRevisionUpload(isFederation)
	: validateMany([singleFileUpload('file', fileFilter), validateRevisionUpload(isFederation)]));

module.exports = Revisions;
