/**
 *  Copyright (C) 2026 3D Repo Ltd
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

type QueryValue = string | number | boolean | null | undefined | QueryValue[];
type QueryParams = Record<string, QueryValue>;

export const parse = (search: string): QueryParams => {
	const params = new URLSearchParams(search);
	const result: QueryParams = Object.create(null);

	params.forEach((value, key) => {
		if (result[key] === undefined) {
			result[key] = value;
		} else {
			result[key] = Array.isArray(result[key]) ? [...result[key], value] : [result[key], value];
		}
	});

	return result;
};

export const stringify = (params: QueryParams = {}) => {
	const searchParams = new URLSearchParams();

	Object.keys(params).sort().forEach((key) => {
		const value = params[key];
		const values = Array.isArray(value) ? value : [value];

		values.forEach((item) => {
			if (item !== undefined) {
				searchParams.append(key, item === null ? '' : String(item));
			}
		});
	});

	return searchParams.toString();
};
