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

function formatBytes() {

	return (input, referenceValue) => {
		let bytesInMB: number = 1048576;
		let bytesInGB: number = 1073741824;
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
	}
	
};

function invoiceDate() {
	return (input) => {
		let date: Date = new Date(input);
		let invoiceDate: string;

		invoiceDate = (date.getDate() < 10 ? "0" : "") + date.getDate() + "-" +
			((date.getMonth() + 1) < 10 ? "0" : "") + (date.getMonth() + 1) + "-" +
			date.getFullYear() + " " +
			(date.getHours() < 10 ? "0" : "") + date.getHours() + ":" +
			(date.getMinutes() < 10 ? "0" : "") + date.getMinutes();

		return invoiceDate;
	}
};

function prettyDate() {
	return (input, showSeconds) => {
		let date: Date = new Date(input);
		let modelDate: string;

		modelDate = (date.getDate() < 10 ? "0" : "") + date.getDate() + "-" +
			((date.getMonth() + 1) < 10 ? "0" : "") + (date.getMonth() + 1) + "-" +
			date.getFullYear();

		const showSecondsDefined = (showSeconds !== undefined && showSeconds !== undefined);
		if (showSecondsDefined) {
			modelDate += ", " + (date.getHours() < 10 ? "0" : "") + date.getHours() + ":" +
				(date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
		}

		return modelDate;
	}
};

function prettyGMTDate() {
	return (input) => {
		const date = new Date(input);
		return date.toISOString().substr(0,10);
	}
	
};

function revisionDate() {
	return (input) => {
		return new Date(Date.parse(input)).toLocaleString();
	}
};

export const FormatBytesModule = angular
	.module('3drepo')
	.filter('formatBytes', formatBytes);

export const InvoiceDateModule = angular
	.module('3drepo')
	.filter('invoiceDate', invoiceDate);

export const PrettyDateModule = angular
	.module('3drepo')
	.filter('prettyDate', prettyDate);

export const PrettyGMTDate = angular
	.module('3drepo')
	.filter('prettyGMTDate', prettyGMTDate);

export const RevisionDateModule = angular
	.module('3drepo')
	.filter('revisionDate', revisionDate);
	
	

