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

const { addModel, deleteModel, getModelList } = require('./commons/modelList');
const { appendFavourites, deleteFavourites } = require('./commons/favourites');
const { getContainerById, getContainers, updateModelSettings } = require('../../../../models/modelSettings');
const { getLatestRevision, getRevisionByIdOrTag, getRevisionCount, getRevisionFormat, getRevisions, updateRevisionStatus } = require('../../../../models/revisions');
const Comments = require('./commons/tickets.comments');
const Groups = require('./commons/groups');
const TicketGroups = require('./commons/tickets.groups');
const Tickets = require('./commons/tickets');
const Views = require('./commons/views');
const { deleteIfUndefined } = require('../../../../utils/helper/objects');
const fs = require('fs/promises');
const { getFileAsStream } = require('../../../../services/filesManager');
const { getProjectById } = require('../../../../models/projectSettings');
const { logger } = require('../../../../utils/logger');
const { modelTypes } = require('../../../../models/modelSettings.constants');
const { queueModelUpload } = require('../../../../services/modelProcessing');
const { templates } = require('../../../../utils/responseCodes');
const { timestampToString } = require('../../../../utils/helper/dates');

const Containers = { ...Groups, ...Views, ...Tickets, ...Comments, ...TicketGroups };

Containers.addContainer = addModel;

Containers.deleteContainer = deleteModel;

Containers.getContainerList = async (teamspace, project, user) => {
	const { models } = await getProjectById(teamspace, project, { permissions: 1, models: 1 });
	const modelSettings = await getContainers(teamspace, models, { _id: 1, name: 1, permissions: 1 });

	return getModelList(teamspace, project, user, modelSettings);
};

Containers.getContainerStats = async (teamspace, project, container) => {
	let latestRev = {};
	const [settings, revCount] = await Promise.all([
		getContainerById(teamspace, container, { name: 1, type: 1, properties: 1, status: 1, errorReason: 1 }),
		getRevisionCount(teamspace, container),
	]);

	try {
		latestRev = await getLatestRevision(teamspace, container, modelTypes.CONTAINER, { tag: 1, timestamp: 1 });
	} catch {
		// do nothing. A container can have 0 revision.
	}

	const stats = {
		type: settings.type,
		code: settings.properties.code,
		status: settings.status,
		unit: settings.properties.unit,
		revisions: {
			total: revCount,
			lastUpdated: latestRev.timestamp,
			latestRevision: latestRev.tag || timestampToString(latestRev.timestamp?.getTime()),
		},
	};

	if (settings.status === 'failed' && settings.errorReason) {
		stats.errorReason = {
			message: settings.errorReason.message,
			timestamp: settings.errorReason.timestamp,
		};
	}

	return stats;
};

Containers.getRevisions = async (teamspace, project, container, showVoid) => {
	const revisions = await getRevisions(teamspace, project, container, modelTypes.CONTAINER, showVoid,
		{ _id: 1, author: 1, timestamp: 1, tag: 1, void: 1, desc: 1, rFile: 1 });

	return revisions.map(({ rFile, ...r }) => {
		const format = getRevisionFormat(rFile);
		return { ...r, ...deleteIfUndefined({ format }) };
	});
};

Containers.newRevision = async (teamspace, container, data, file) => {
	const { properties: { unit: units } = {} } = await getContainerById(teamspace, container, { 'properties.unit': 1 });
	await queueModelUpload(teamspace, container, { ...data, units }, file).finally(() => fs.rm(file.path).catch((e) => {
		logger.logError(`Failed to delete uploaded file: ${e.message}`);
	}));
};

Containers.updateRevisionStatus = (teamspace, project, container, revision, status) => updateRevisionStatus(
	teamspace, project, container, modelTypes.CONTAINER, revision, status);

Containers.downloadRevisionFiles = async (teamspace, container, revision) => {
	const rev = await getRevisionByIdOrTag(teamspace, container, modelTypes.CONTAINER, revision, { rFile: 1 },
		{ includeVoid: true },
	);

	if (!rev.rFile?.length) {
		throw templates.fileNotFound;
	}

	// We currently only support single file fetches
	const fileName = rev.rFile[0];
	const fileNameFormatted = fileName.substr(36).replace(/_([^_]*)$/, '.$1');
	const file = await getFileAsStream(teamspace, `${container}.history.ref`, fileName);
	return { ...file, filename: fileNameFormatted };
};

Containers.appendFavourites = async (username, teamspace, project, favouritesToAdd) => {
	const accessibleContainers = await Containers.getContainerList(teamspace, project, username);
	return appendFavourites(username, teamspace, accessibleContainers, favouritesToAdd);
};

Containers.deleteFavourites = async (username, teamspace, project, favouritesToRemove) => {
	const accessibleContainers = await Containers.getContainerList(teamspace, project, username);
	return deleteFavourites(username, teamspace, accessibleContainers, favouritesToRemove);
};

Containers.updateSettings = updateModelSettings;

Containers.getSettings = (teamspace, container) => getContainerById(teamspace,
	container, { corID: 0, account: 0, permissions: 0 });

module.exports = Containers;
