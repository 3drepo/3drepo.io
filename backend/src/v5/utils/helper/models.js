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

const db = require('../../handler/db');
const { deleteModel } = require('../../models/modelSettings');
const { removeAllFilesFromModel } = require('../../models/fileRefs');

const ModelHelper = {};

const removeModelCollections = async (ts, model) => {
	const collections = await db.listCollections(ts);
	const promises = [];

	collections.flatMap(({ name }) => (name.startsWith(`${model}.`) ? promises.push(db.dropCollection(ts, name)) : []));

	return Promise.all(promises);
};

ModelHelper.removeModelData = async (teamspace, model) => {
	// This needs to be done before removeModelCollections or we risk the .ref col being deleted before we check it
	await removeAllFilesFromModel(teamspace, model);

	return Promise.all([
		removeModelCollections(teamspace, model),
		deleteModel(teamspace, model),
	]);
};

module.exports = ModelHelper;
