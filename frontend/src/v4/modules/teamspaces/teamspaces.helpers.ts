/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import { orderBy } from 'lodash';
import memoizeOne from 'memoize-one';

import { PROJECT_ROLES_TYPES } from '../../constants/project-permissions';
import { SORT_ORDER_TYPES } from '../../constants/sorting';

export const sortModels = (models, sortingField, sortingDirection) => {
	const getSortingFieldValue = (model) => model[sortingField]
		? model[sortingField].toLowerCase()
		: model[sortingField];

	return orderBy(models,
		['federate', getSortingFieldValue],
		[SORT_ORDER_TYPES.ASCENDING, sortingDirection[sortingField]]
	);
};
