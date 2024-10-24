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

const { checkQuotaIsSufficient, fileFilter } = require('./commons/revisions');
const { createResponseCode, templates } = require('../../../../../../utils/responseCodes');
const Yup = require('yup');
const YupHelper = require('../../../../../../utils/helper/yup');
const { getModelById } = require('../../../../../../models/modelSettings');
const { getModelByQuery } = require('../../../../../../models/modelSettings');
const { isTagUnique } = require('../../../../../../models/revisions');
const { processStatuses } = require('../../../../../../models/modelSettings.constants');
const { respond } = require('../../../../../../utils/responder');
const { singleFileUpload } = require('../../../../multer');
const tz = require('countries-and-timezones');
const { validateMany } = require('../../../../../common');

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

const validateRevisionUpload = async (req, res, next) => {
	const schemaBase = {
		tag: YupHelper.types.strings.code.test('tag-not-in-use',
			'Revision name is already used by an existing revision',
			(value) => value === undefined || isTagUnique(req.params.teamspace,
				req.params.container, value)).required(),
		desc: YupHelper.types.strings.shortDescription,
		importAnimations: Yup.bool().default(true),
		timezone: Yup.string().test('valid-timezone',
			'The timezone provided is not valid',
			(value) => value === undefined || !!tz.getTimezone(value)),
		lod: Yup.number().min(0).max(6).default(0),
	};

	const schema = Yup.object().noUnknown().required().shape(schemaBase)
		.test('check-model-status', 'A revision is already being processed.', async () => {
			const { teamspace, container } = req.params;
			const { status } = await getModelById(teamspace, container, { _id: 0, status: 1 });
			return status === processStatuses.OK || status === processStatuses.FAILED || !status;
		});

	try {
		req.body = await schema.validate(req.body);
		await next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

Containers.validateNewRevisionData = validateMany([singleFileUpload('file', fileFilter(ACCEPTED_CONTAINER_EXT)), checkQuotaIsSufficient, validateRevisionUpload]);

module.exports = Containers;
