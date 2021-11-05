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

"use strict";

const batchPromises = (promiseGenerator, dataToBatch, size) => {
	const promises = [];
	for(let i = 0; i < dataToBatch.length; i = i + size) {
		const endIndex = Math.min(i + size , dataToBatch.length);
		const batchedData = dataToBatch.slice(i, endIndex);
		promises.push(promiseGenerator(batchedData));
	}
	return Promise.all(promises);
};

module.exports = {
	batchPromises
};