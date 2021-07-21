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

export const filterNestedData = (data: any[], condition: (i: any) => any[], childrenPath: string = 'subActivities') => {
	const lists = [];
	data.forEach((item) => {
		let result;
		if (condition(item)) {
			result = { ...item };
		} else if (item[childrenPath]) {
			const children = filterNestedData(item[childrenPath], condition);

			if (children.length > 0) {
				result = { ...item, [childrenPath]: children };
			}
		}

		if (result) {
			lists.push(result);
		}
	});

	return lists;

};
