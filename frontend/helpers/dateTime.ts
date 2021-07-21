/**
 *  Copyright (C) 2020 3D Repo Ltd
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

export const MILLI_PER_HOUR = 1000 * 60 * 60;
export const MILLI_PER_DAY = 1000 * 60 * 60 * 24;

export const getDays = (min, max) => {
	const maxDate = new Date(max).setHours(0, 0, 0, 0);
	const minDate = new Date(min).setHours(0, 0, 0, 0);
	return  Math.round((maxDate - minDate) / MILLI_PER_DAY);
};

export const getDate = (base, days) => {
	const baseDate = new Date(base).setHours(0, 0, 0, 0);
	return new Date(baseDate.valueOf() + days * MILLI_PER_DAY);
};

export const isDateOutsideRange = (min, max, date) =>  max < date || min > date;
