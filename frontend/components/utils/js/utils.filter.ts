import { number } from "prop-types";

/**
 *  Copyright (C) 2016 3D Repo Ltd
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

import { formatBytes, formatBytesGB } from '../../../services/formatting/formatCapacity';
import { invoiceDate, prettyDate } from '../../../services/formatting/formatDate';

/**
 * Gets the date of the sunday thats away from the offset .
 * If offsets == 0 is last sunday (if today is sunday returns today)
 * If offset > 0 , the sundays from next week on
 * If offset < 0 , the sundays before the current week
 */
export const getSunday = (offset: number = 0) => {
	const sunday = new Date();
	sunday.setDate(sunday.getDate() - sunday.getDay() + offset * 7 );
	sunday.setHours(0, 0, 0, 0);
	return sunday;
};

export const simpleDate = (input) => {
	const date: Date = new Date(input);
	return date.toLocaleDateString("en-GB", {day: "numeric", month: "short", year: "numeric"});
};

export const FormatBytesGBModule = angular
	.module("3drepo")
	.filter("formatBytesGB", () => formatBytesGB);

export const FormatBytesModule = angular
	.module("3drepo")
	.filter("formatBytes", () => formatBytes);

export const InvoiceDateModule = angular
	.module("3drepo")
	.filter("invoiceDate", () => invoiceDate);

export const PrettyDateModule = angular
	.module("3drepo")
	.filter("prettyDate", () => prettyDate);
