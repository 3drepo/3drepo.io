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
// Deliberately NOT extending jest.config.v5.js: some v4 unit tests (db.js,
// checkPermissions.js) hit a real, pre-seeded MongoDB test DB dump rather
// than the @shelf/jest-mongodb in-memory instance used by v5, and are not
// measured against the v5 coverage thresholds.
//
// maxWorkers is pinned to 1: mocha used to run every unit file serially in a
// single process. Several files share state in the same real Mongo DB (e.g.
// role creation/grant/revoke in db.js), so running files concurrently across
// workers can race against each other and produce spurious connection
// errors.
module.exports = {
	clearMocks: true,
	collectCoverage: false,
	maxWorkers: 1,
	testEnvironment: 'node',
	testMatch: ['**/tests/v4/unit/**/*.js'],
	testPathIgnorePatterns: [
		'/node_modules/',
		'/tests/v4/unit/mock/',
	],
	testTimeout: 30000,
};
