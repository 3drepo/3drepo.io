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

const config = require('./jest.config');

config.coveragePathIgnorePatterns = [
	...config.coveragePathIgnorePatterns,
	// require code coverage on routes folder and services/chat folder
	'^((?!routes|services\/chat).)*$'
];

config.testMatch = ['**/tests/**/e2e/**/*.test.[jt]s?(x)'];
config.testSequencer = './jest.sequencer.e2e.js'
config.setupFiles = ["./tests/v5/e2e/setup.js"];
config.testTimeout= 30000,

module.exports = config;
