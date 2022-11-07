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

import { isString, isEmpty } from 'lodash';
import { TITLE_INPUT_NAME } from '../store/tickets/tickets.helpers';

export const dirtyValues = (
	dirtyFields: object | boolean,
	allValues: object,
) => {
// If *any* item in an array was modified, the entire array must be submitted, because there's no way to indicate
// "placeholders" for unchanged elements. `dirtyFields` is true for leaves.
	if (dirtyFields === true || Array.isArray(dirtyFields)) return allValues;
	// Here, we have an object
	return Object.fromEntries(
		Object.keys(dirtyFields).map((key) => [
			key,
			dirtyValues(dirtyFields[key], allValues[key]),
		]),
	);
};

const nullifyEmptyStrings = (values = {}) => Object.keys(values).reduce((accum, key) => {
	const val = (isString(values[key]) && !values[key]) ? null : values[key];
	return { ...accum, [key]: val };
}, {});

export const nullifyAllValuesEmptyStrings = (values) => {
	const fields: any = values[TITLE_INPUT_NAME] ? { [TITLE_INPUT_NAME]: values[TITLE_INPUT_NAME] } : {};

	const properties = nullifyEmptyStrings(values.properties);
	const modules = nullifyEmptyStrings(values.modules);

	if (!isEmpty(properties)) {
		fields.properties = properties;
	}
	if (!isEmpty(modules)) {
		fields.modules = modules;
	}

	return fields;
};
