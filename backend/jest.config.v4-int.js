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

// Jest config for legacy v4 integrated tests (previously run via mocha).
// Deliberately NOT extending jest.config.js: v4 integrated tests connect to a
// real, pre-seeded MongoDB test DB dump (not the @shelf/jest-mongodb
// in-memory instance used by v5), and are not measured against v5 coverage
// thresholds.
//
// Must be run with --runInBand: each test file spins up its own HTTP server
// on a fixed port (8080), so running files concurrently in separate workers
// would clash.
module.exports = {
	clearMocks: true,
	collectCoverage: false,
	// mocha's scripts ran with `--exit`, which force-kills the process
	// regardless of lingering open handles (e.g. MongoDB/HTTP server sockets
	// left open). Without an equivalent, jest just hangs waiting for the
	// event loop to drain.
	forceExit: true,
	maxWorkers: '50%',
	setupFilesAfterEnv: ['./tests/v4/setup.js'],
	testEnvironment: 'node',
	testMatch: ['**/tests/v4/integrated/**/*.js'],
	testPathIgnorePatterns: [
		'/node_modules/',
	],
	testTimeout: 5000,
};
