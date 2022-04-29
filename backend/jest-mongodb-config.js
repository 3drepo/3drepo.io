/**
 *  Copyright (C) 2021 3D Repo Ltd
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

module.exports = {
	mongodbMemoryServerOptions: {
		binary: {
			version: '5.0.8',
			skipMD5: true,
			downloadDir: './node_modules/.cache',
		},
		instance: {
			auth: false,
			dbName: 'admin',
			ip: '127.0.0.1',
			port: 27227,
		},
		autoStart: false,
	},
};
