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

import { schema } from 'normalizr';

const idAttribute = (field = '_id') => (data) => data[field];

const model = new schema.Entity('models', {}, {
	idAttribute: idAttribute('model'),
	processStrategy: (value, parent) => {
		return {
			...value,
			projectName: parent._id
		};
	}
});

const project = new schema.Entity('projects', {
	models: [model]
}, {
	idAttribute: idAttribute('_id'),
	processStrategy: (value, parent) => {
		return {
			...value,
			teamspace: parent.account
		};
	}
});

export const teamspacesSchema = new schema.Entity('teamspaces', {
	projects: [project]
}, {
	idAttribute: idAttribute('account')
});
