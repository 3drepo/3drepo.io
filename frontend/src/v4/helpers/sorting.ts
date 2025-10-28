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

import {orderBy} from 'lodash';

export const sortByName = (data = [], options: {order: any}) => {
	return orderBy(
		data,
		({lastName, firstName}) => `${firstName} ${lastName}`.toLowerCase().trim(),
		options.order
	);
};

export const sortByJob = (data = [], options: {order: any}) => {
	return orderBy(data, ['job'], options.order);
};

export const sortByField = (data = [], options: {order: any, config: any}) => {
	if (!options.config && !options.config.field) {
		throw new Error('This sorting method requires field name');
	}

	return orderBy(
		data,
		(item) => (item[options.config.field] || '').toLowerCase().trim(),
		options.order
	);
};

export const sortByDate = (data = [], options: {order: any}, fieldName = 'created') => {
	return orderBy(
		data,
		(item) => new Date(item[fieldName]),
		options.order
	);
};
