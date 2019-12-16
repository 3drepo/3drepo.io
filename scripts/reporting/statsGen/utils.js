/**
*	Copyright (C) 2019 3D Repo Ltd
*
*	This program is free software: you can redistribute it and/or modify
*	it under the terms of the GNU Affero General Public License as
*	published by the Free Software Foundation, either version 3 of the
*	License, or (at your option) any later version.
*
*	This program is distributed in the hope that it will be useful,
*	but WITHOUT ANY WARRANTY; without even the implied warranty of
*	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*	GNU Affero General Public License for more details.
*
*	You should have received a copy of the GNU Affero General Public License
*	along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

'use strict'
const dateFormat = require('dateformat');
const fs = require('fs');
const concat = require('concat-files');
const Utils = {};

Utils.concat = (files, dest) => {
	return new Promise((resolve, error) => {
		concat(files, dest, (err) => {
			if(err) error(err);
			else resolve();
		});
	});
}

Utils.formatDate = (date) => {
	return dateFormat(date, 'dd-mm-yy');
}

Utils.generateFileName = (prefix) => {
	const date = Utils.formatDate(new Date());
	return `${prefix}_${date}.csv`;
}

Utils.mkdir = (dir) => {
	return new Promise((resolve, error) => {
		fs.mkdir(dir, {recursive: true}, (err) => {
			if(err) error(err);
			else resolve();
		});
	});
}

Utils.skipUser = (username) => {
	return username === 'adminUser' || username === 'nodeUser';
}

module.exports = Utils;
