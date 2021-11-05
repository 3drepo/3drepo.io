/**
 *  Copyright (C) 2017 3D Repo Ltd
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

"use strict";
(() => {
	// calulate how many weeks an issue has been created.
	// 0 - <=1 = week 0
	// >1 - <=2 = week 1
	// ...

	module.exports = {
		"$ceil": {
			"$divide": [
				{"$subtract": [new Date().valueOf(), "$$CURRENT.created"]},
				// one week in milliseconds
				604800000
			]
		}
	};

})();
