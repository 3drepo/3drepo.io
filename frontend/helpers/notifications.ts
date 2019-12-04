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
import { groupBy, sortBy, toArray } from 'lodash';

/**
 * Gets the date of the sunday thats away from the offset .
 * If offsets == 0 is last sunday (if today is sunday returns today)
 * If offset > 0 , the sundays from next week on
 * If offset < 0 , the sundays before the current week
 */
export const getSunday = (offset: number = 0) => {
	const sunday = new Date();
	sunday.setDate(sunday.getDate() - sunday.getDay() + offset * 7);
	sunday.setHours(0, 0, 0, 0);
	return sunday;
};

export const groupByTeamSpace = (notifications) => {
	return toArray(groupBy(sortBy(notifications, 'teamSpace'), 'teamSpace'));
};
