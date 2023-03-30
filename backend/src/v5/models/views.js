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

const Views = {};
const { VIEWS_COL } = require('./views.constants');
const db = require('../handler/db');
const { templates } = require('../utils/responseCodes');

Views.getViewById = async (teamspace, model, id, projection) => {
	const foundView = await db.findOne(teamspace, VIEWS_COL, { _id: id, model }, projection);

	if (!foundView) {
		throw templates.viewNotFound;
	}

	return foundView;
};

Views.getViews = (teamspace, model, projection) => db.find(teamspace, VIEWS_COL, { model }, projection);

Views.initialise = (teamspace) => db.createIndex(teamspace, VIEWS_COL,
	{ teamspace: 1, project: 1, model: 1 }, { runInBackground: true });

Views.removeAllViewsInModel = async (teamspace, project, model) => {
	await db.deleteMany(teamspace, VIEWS_COL, { teamspace, project, model });
};

module.exports = Views;
