/**
 *  Copyright (C) 2026 3D Repo Ltd
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

// Jest config for legacy v4 unit tests (previously run via mocha).
// Deliberately NOT extending jest.config.js: v4 tests do not use the
// @shelf/jest-mongodb in-memory preset (they don't touch the DB at all in
// the unit suite) and are not measured against the v5 coverage thresholds.
module.exports = {
	clearMocks: true,
	collectCoverage: false,
	maxWorkers: '50%',
	testEnvironment: 'node',
	testMatch: ['**/tests/v4/unit/**/*.js'],
	testPathIgnorePatterns: [
		'/node_modules/',
		'/tests/v4/unit/mock/',
	],
	testTimeout: 30000,
};
