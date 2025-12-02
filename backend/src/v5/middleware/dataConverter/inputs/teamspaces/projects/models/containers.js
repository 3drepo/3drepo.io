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

const { basename, extname } = require('path');
const { checkQuotaIsSufficient, fileFilter } = require('./commons/revisions');
const { codeExists, createResponseCode, templates } = require('../../../../../../utils/responseCodes');
const FSHandler = require('../../../../../../handler/fs');
const { FileStorageTypes } = require('../../../../../../utils/config.constants');
const Yup = require('yup');
const config = require('../../../../../../utils/config');
const { createNewUserRecord } = require('../../../../../../processors/users');
const { generateUUIDString } = require('../../../../../../utils/helper/uuids');
const { getModelById } = require('../../../../../../models/modelSettings');
const { getModelByQuery } = require('../../../../../../models/modelSettings');
const { getUserByEmail } = require('../../../../../../models/users');
const { getUserFromSession } = require('../../../../../../utils/sessions');
const { isTagUnique } = require('../../../../../../models/revisions');
const { processStatuses } = require('../../../../../../models/modelSettings.constants');
const { respond } = require('../../../../../../utils/responder');
const { singleFileUpload } = require('../../../../multer');
const tz = require('countries-and-timezones');
const { validateMany } = require('../../../../../common');
const { types: yupTypes } = require('../../../../../../utils/helper/yup');

const Containers = {};

const ACCEPTED_CONTAINER_EXT = [
	'.x', '.obj', '.3ds', '.md3', '.md2', '.ply',
	'.mdl', '.ase', '.hmp', '.smd', '.mdc', '.md5',
	'.stl', '.lxo', '.nff', '.raw', '.off', '.ac',
	'.bvh', '.irrmesh', '.irr', '.q3d', '.q3s', '.b3d',
	'.dae', '.ter', '.csm', '.3d', '.lws', '.xml', '.ogex',
	'.ms3d', '.cob', '.scn', '.blend', '.pk3', '.ndo',
	'.ifc', '.xgl', '.zgl', '.fbx', '.assbin', '.bim', '.dgn',
	'.rvt', '.rfa', '.spm', '.dwg', '.dxf', '.nwd', '.nwc',
];

Containers.canDeleteContainer = async (req, res, next) => {
	try {
		const { teamspace, container } = req.params;

		const query = {
			'subModels._id': container,
		};

		const fed = await getModelByQuery(teamspace, query, { _id: 1, name: 1 }).catch(() => {});
		if (fed) {
			respond(req, res, createResponseCode(templates.containerIsSubModel, `Container is an active sub model of ${fed.name}(${fed._id})`));
		} else {
			next();
		}
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

const getOwnerUserFromEmail = async (email) => {
	try {
		const { user } = await getUserByEmail(email, { user: 1 });
		return user;
	} catch (err) {
		if (err.code === templates.userNotFound.code) {
			// the email is not a recognised user in the platform, setup a new user with this email
			const id = generateUUIDString();
			await createNewUserRecord({ email, id, name: email });
			return id;
		}
		throw err;
	}
};

const validateRevisionUpload = (internal) => async (req, res, next) => {
	try {
		const schemaBase = {
			tag: yupTypes.strings.code.test('tag-not-in-use',
				'Revision name is already used by an existing revision',
				(value) => value === undefined || isTagUnique(req.params.teamspace,
					req.params.container, value)).required(),
			desc: yupTypes.strings.shortDescription,
			importAnimations: Yup.bool().default(true),
			timezone: Yup.string().test('valid-timezone',
				'The timezone provided is not valid',
				(value) => value === undefined || !!tz.getTimezone(value)),
			lod: Yup.number().min(0).max(6).default(0),
		};

		if (internal) {
			schemaBase.owner = yupTypes.strings.email.required("Owner's email is required for internal uploads");
		}

		const schema = Yup.object().noUnknown().required().shape(schemaBase)
			.test('check-model-status', 'A revision is already being processed.', async () => {
				const { teamspace, container } = req.params;
				const { status } = await getModelById(teamspace, container, { _id: 0, status: 1 });
				return status === processStatuses.OK || status === processStatuses.FAILED || !status;
			});

		req.body = await schema.validate(req.body);

		if (internal) {
			req.body.owner = await getOwnerUserFromEmail(req.body.owner);
		} else {
			req.body.owner = getUserFromSession(req.session);
		}

		await next();
	} catch (err) {
		const response = codeExists(err.code) ? err : createResponseCode(templates.invalidArguments, err?.message);
		respond(req, res, response);
	}
};

const checkFileFromPath = async (req, res, next) => {
	try {
		if (!req.body.file) throw new Error('File is required');
		const fsHandler = FSHandler.getHandler(FileStorageTypes.EXTERNAL_FS);
		const { path, size } = await fsHandler.getFileInfo(req.body.file);
		const file = { path, size, originalname: basename(path), readOnly: true };

		// get file extension from original file name
		const ext = extname(path).toLowerCase();

		if (!ext || !ACCEPTED_CONTAINER_EXT.includes(ext)) {
			throw templates.unsupportedFileFormat;
		}

		req.file = file;
		delete req.body.file;
		await next();
	} catch (err) {
		const response = codeExists(err.code) ? err : createResponseCode(templates.invalidArguments, err?.message);
		respond(req, res, response);
	}
};

Containers.validateNewRevisionData = (internal) => (internal
	? validateMany([checkFileFromPath, checkQuotaIsSufficient, validateRevisionUpload(internal)])
	: validateMany([singleFileUpload('file', fileFilter(ACCEPTED_CONTAINER_EXT)), checkQuotaIsSufficient, validateRevisionUpload(internal)]));

module.exports = Containers;
