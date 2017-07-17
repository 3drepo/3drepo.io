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

(function () {
	"use strict";

	angular.module("3drepo")

		.filter("formatBytes", function() {
			return function(input, referenceValue) {
				var bytesInMB = 1048576,
					bytesInGB = 1073741824,
					factor,
					units;

				// referenceValue is used for consistency of units
				if (angular.isDefined(referenceValue)) {
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
		})

		.filter("invoiceDate", function () {
			return function(input) {
				var date = new Date(input),
					invoiceDate;

				invoiceDate = (date.getDate() < 10 ? "0" : "") + date.getDate() + "-" +
					((date.getMonth() + 1) < 10 ? "0" : "") + (date.getMonth() + 1) + "-" +
					date.getFullYear() + " " +
					(date.getHours() < 10 ? "0" : "") + date.getHours() + ":" +
					(date.getMinutes() < 10 ? "0" : "") + date.getMinutes();

				return invoiceDate;
			};
		})

		.filter("prettyDate", function () {
			return function(input, showSeconds) {
				var date = new Date(input),
					modelDate;

				modelDate = (date.getDate() < 10 ? "0" : "") + date.getDate() + "-" +
					((date.getMonth() + 1) < 10 ? "0" : "") + (date.getMonth() + 1) + "-" +
					date.getFullYear();

				if (angular.isDefined(showSeconds) && showSeconds) {
					modelDate += ", " + (date.getHours() < 10 ? "0" : "") + date.getHours() + ":" +
						(date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
				}

				return modelDate;
			};
		})


		.filter("prettyGMTDate", function () {
			return function(input) {
				var date = new Date(input);
				return date.toISOString().substr(0,10);
			};
		})

		.filter("revisionDate", function () {
			return function(input) {
				return new Date(Date.parse(input)).toLocaleString();
			};
		});

}());
