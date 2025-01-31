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
import byteSize from 'byte-size';
import { formatDate, formatMessage, formatRelativeTime } from '../services/intl';

type ByteSizeType = {
	value: number,
	unit: string
};

export const formatInfoUnit = (value: number): string => {
	const formattedSize = byteSize(value, { units: 'iec' }) as ByteSizeType;
	return formatMessage({
		id: 'units.information.format',
		defaultMessage: '{value} {unit}',
	}, formattedSize);
};

// Time related functions
const getFormattedRelativeTime = (timeDifference, unit) => formatRelativeTime(-Math.max(Math.floor(timeDifference), 1), unit);
export const getRelativeTime = (from: Date | number) => {
	let timeDifference = ((new Date().getTime() - new Date(from).getTime()) / 1000) + 1;
	if (timeDifference < 60) return getFormattedRelativeTime(timeDifference, 'second');

	timeDifference /= 60;
	if (timeDifference < 60) return getFormattedRelativeTime(timeDifference, 'minute');

	timeDifference /= 60;
	if (timeDifference < 24) return getFormattedRelativeTime(timeDifference, 'hour');

	timeDifference /= 24;
	if (timeDifference < 30) return getFormattedRelativeTime(timeDifference, 'day');
	const daysDifference = timeDifference;

	timeDifference /= 30;
	if (timeDifference < 12) return getFormattedRelativeTime(timeDifference, 'month');

	return getFormattedRelativeTime(daysDifference / 365, 'year');
};

export const formatSimpleDate = (date) => formatDate(date, { // DD/MM/YYYY
	day: 'numeric',
	month: 'numeric',
	year: 'numeric',
});

export const formatDateTime = (date) => formatDate(date, { // DD/MM/YYYY hh:mm
	hour: 'numeric',
	minute: 'numeric',
	day: 'numeric',
	month: 'numeric',
	year: 'numeric',
	hour12: false,
})?.replaceAll(',', '');

export const formatFilenameDate = (date) => formatDate(date, { // DD_MM_YYYY_HH_mm_ss
	hour: 'numeric',
	minute: 'numeric',
	second: 'numeric',
	day: 'numeric',
	month: 'numeric',
	year: 'numeric',
	hour12: false,
}).replaceAll(/\W+/g, '_');
