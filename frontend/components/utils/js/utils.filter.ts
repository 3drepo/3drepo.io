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

export const simpleDate = (input) => {
	const date: Date = new Date(input);
	return date.toLocaleDateString("en-GB", {day: "numeric", month: "short", year: "numeric"});
}

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
