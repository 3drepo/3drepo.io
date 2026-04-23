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

// Custom ESLint import resolver that handles ESM packages which only expose
// an `exports` field (no `main` field), such as uuid v9+.

'use strict';

const resolve = require('resolve/sync');
const isCoreModule = require('is-core-module');
const path = require('path');

exports.interfaceVersion = 2;

const CONDITION_PRIORITY = ['node', 'require', 'default', 'import'];

function resolveCondition(exp) {
	if (typeof exp === 'string') return exp;
	if (!exp || typeof exp !== 'object') return null;

	for (const condition of CONDITION_PRIORITY) {
		if (Object.hasOwn(exp, condition)) {
			const resolved = resolveCondition(exp[condition]);
			if (resolved) return resolved;
		}
	}

	return null;
}

function resolveExportsToMain(pkg) {
	if (pkg.main || !pkg.exports) return pkg;

	const rootExport = pkg.exports['.'] ?? pkg.exports;
	const main = resolveCondition(rootExport);
	if (main) pkg.main = main;

	return pkg;
}

exports.resolve = function (source, file, config) {
	if (isCoreModule(source)) {
		return { found: true, path: null };
	}

	try {
		const resolvedPath = resolve(source, {
			extensions: ['.mjs', '.js', '.json', '.node'],
			...config,
			basedir: path.dirname(path.resolve(file)),
			packageFilter: resolveExportsToMain,
		});
		return { found: true, path: resolvedPath };
	} catch {
		return { found: false };
	}
};
