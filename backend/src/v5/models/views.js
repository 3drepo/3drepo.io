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
const db = require('../handler/db');
const { templates } = require('../utils/responseCodes');

const getCollectionName = (model) => `${model}.views`;

Views.checkViewExists = async (teamspace, model, view) => {
	const foundView = await db.findOne(teamspace, getCollectionName(model), { _id: view });

	if (!foundView) {
		throw templates.viewNotFound;
	}
};

module.exports = Views;
