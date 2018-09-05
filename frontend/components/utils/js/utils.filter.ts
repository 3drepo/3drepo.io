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

function formatBytesGB() {

	return (input: number, referenceValue: number) => {
		const factor: number = 1024; // Numbers are assumed to be in MBs.
		const units: string = "GB";
		return (Math.round(input / factor * 100) / 100).toString() + units; // (input / bytesInAGb).toFixed(2)
	};

}

function formatBytes() {

	return (input: number, referenceValue: number) => {

		const bytesInMB: number = 1048576;
		const bytesInGB: number = 1073741824;
		let factor: number;

		let units: string;

		// referenceValue is used for consistency of units
		if (referenceValue !== undefined || referenceValue !== null) {
			if (referenceValue > 1073741824) {
				factor = bytesInGB;
				units = " GB";
			} else {
				factor = bytesInMB;
				units = " MB";
			}
		} else {
			if (input > 1073741824) {
				factor = bytesInGB;
				units = " GB";
			} else {
				factor = bytesInMB;
				units = " MB";
			}
		}

		return (Math.round(input / factor * 100) / 100).toString() + units; // (input / bytesInAGb).toFixed(2)
	};

}

function invoiceDate() {
	return (input) => {
		const date: Date = new Date(input);
		let invoiceDateStr: string;

		invoiceDateStr = (date.getDate() < 10 ? "0" : "") + date.getDate() + "-" +
			((date.getMonth() + 1) < 10 ? "0" : "") + (date.getMonth() + 1) + "-" +
			date.getFullYear() + " " +
			(date.getHours() < 10 ? "0" : "") + date.getHours() + ":" +
			(date.getMinutes() < 10 ? "0" : "") + date.getMinutes();

		return invoiceDateStr;
	};
}

function prettyDate() {
	return (input, showFullDateTime) => {
		const date: Date = new Date(input);
		const today: Date = new Date();
		const options: any = {};

		if (showFullDateTime ||
			today.getFullYear() === date.getFullYear() &&
			today.getMonth() === date.getMonth() &&
			today.getDate() === date.getDate()) {
			options.hour = "numeric";
			options.minute = "numeric";

			if (showFullDateTime) {
				options.second = "numeric"
			} else {
				options.hour12 = true;
				options.weekday = "short";
			}
		} else {
			if ((new Date).getFullYear() !== date.getFullYear()) {
				options.year = "numeric";
			}

			options.month = "short";
			options.day =  "numeric";
		}

		return date.toLocaleDateString('en-GB', options).replace(",", "");
	};
}

export const FormatBytesGBModule = angular
	.module("3drepo")
	.filter("formatBytesGB", formatBytesGB);

export const FormatBytesModule = angular
	.module("3drepo")
	.filter("formatBytes", formatBytes);

export const InvoiceDateModule = angular
	.module("3drepo")
	.filter("invoiceDate", invoiceDate);

export const PrettyDateModule = angular
	.module("3drepo")
	.filter("prettyDate", prettyDate);

