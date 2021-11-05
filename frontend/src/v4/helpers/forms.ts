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

import { get, omit } from 'lodash';

export const mergeData = (source, data = source) => {
	const hasUnassignedRole = !data.assigned_roles;

	return {
		...source,
		...omit(data, ['assigned_roles',  'descriptionThumbnail']),
		assigned_roles: hasUnassignedRole ? [] : [data.assigned_roles]
	};
};

export const diffData =  ( vals, data ) => {
	return Object.keys(vals).reduce((acc, key) => {
		if (vals[key] !== data[key] && !Array.isArray(data[key]) && !(!vals[key] && !data[key])) {
			acc[key] = vals[key];
		}

		// for assigned_roles type fields
		if (Array.isArray(data[key]) && data[key][0] !== vals[key] && (data[key][0] || vals[key])) {
			acc[key] = vals[key] ? [vals[key]] : [];
		}

		return acc;
	}, {});
};
