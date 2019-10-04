/**
 *  Copyright (C) 2019 3D Repo Ltd
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

import filesize from 'filesize';
import { EXTENSION_RE } from '../constants/resources';
import * as API from '../services/api';
import { sortByDate } from './sorting';

export const prepareResource = (teamspace, modelId, resource, propertyOverride = {}) => {
	if (!resource.link) {
		resource.link = API.getAPIUrl(`${teamspace}/${modelId}/resources/${resource._id}`);
		resource.type = (resource.name.match(EXTENSION_RE) || ['', ''])[1].toLowerCase();
		resource.size = filesize(resource.size, {round: 0}).replace(' ', '');
	} else {
		resource.type = 'http';
		resource.size = '';
	}

	return {...resource, ...propertyOverride};
};

export const prepareResources = (teamspace, modelId, resources = [], propertyOverride = {}) => {
	const preparedResources = resources.map((resource) => prepareResource(teamspace, modelId, resource, propertyOverride));
	return sortByDate( preparedResources, { order: 'desc' });
};
