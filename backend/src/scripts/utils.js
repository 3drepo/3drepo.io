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

const { v5Path } = require('../interop');

const { listDatabases, listCollections } = require(`${v5Path}/handler/db`);
const { USERNAME_BLACKLIST } = require(`${v5Path}/models/users.constants`);
const { logger } = require(`${v5Path}/utils/logger`);
const FS = require('fs');
const DayJS = require('dayjs');

const Utils = {};

let includeTS = [];
let excludeTS = [];

let showStackTrace = false;

process.argv.forEach((arg) => {
	const res = arg.match(/--includeTS=(\S*)/);
	if (res?.length > 1) {
		includeTS = res[1].split(',');
	}

	const res2 = arg.match(/--excludeTS=(\S*)/);
	if (res2?.length > 1) {
		excludeTS = res2[1].split(',');
	}

	if (arg === '-v') {
		showStackTrace = true;
	}
});

if (includeTS.length && excludeTS.length) throw new Error('Cannot declare both includeTS and excludeTS. Please only use one of the options');

const ignoreTS = [...USERNAME_BLACKLIST, ...excludeTS];

Utils.getTeamspaceList = async () => {
	const dbList = await listDatabases();
	return dbList.flatMap(({ name: db }) => {
		const inIgnoreList = ignoreTS.includes(db);
		const shouldInclude = (!includeTS.length) || includeTS.includes(db);
		return inIgnoreList || !shouldInclude ? [] : db;
	});
};

Utils.getCollectionsEndsWith = async (teamspace, str) => {
	const collections = await listCollections(teamspace);
	return collections.filter(({ name }) => name.endsWith(str));
};

const stringSplice = (string, index, length, replacement) => {
	const before = string.slice(0, index);
	const after = string.slice(index + length);
	return `${before}${replacement}${after}`;
};

Utils.parsePath = (path) => {
	const regex = /[^%]?%([^%]*)%[^%]?/gm;
	const matches = path.matchAll(regex);

	// making a copy of the string to manipulate and return
	let res = `${path}`;

	let offset = 0;

	for (const match of matches) {
		const envVar = process.env[match[1]];
		if (envVar) {
			const wholeMatch = match[0];
			const replacedStr = wholeMatch.replace(`%${match[1]}%`, envVar);
			res = stringSplice(res, match.index + offset, wholeMatch.length, replacedStr);
			offset += replacedStr.length - wholeMatch.length;
		}
	}

	return res;
};

Utils.handleErrorBeforeExit = (err) => {
	logger.logError(err?.message ?? err);
	if (showStackTrace) {
		// eslint-disable-next-line no-console
		console.error(err);
	}
	// eslint-disable-next-line no-process-exit
	process.exit(1);
};

const formatDate = (date) => (date ? DayJS(date).format('DD/MM/YYYY') : '');

Utils.writeLicensesToFile = (results, outFile) => new Promise((resolve) => {
	logger.logInfo(`Writing results to ${outFile}`);
	const writeStream = FS.createWriteStream(outFile);
	writeStream.write('TeamspaceName,LicenseCount,TeamspaceDataTotal(MB),TeamspaceDataUsed(MB),LicenseType,LicenseDataTotal(MB),Collaborators,ExpiryDate\n');
	// for each teamspace, write each license along with some teamspace aggregate data
	results.forEach(({ teamspaceName, licenseCount, dataTotalMB, dataUsedMB, licenses }) => {
		licenses.forEach(([licenseType, license]) => {
			const { collaborators, expiryDate, data } = license;
			writeStream.write(`${teamspaceName},${licenseCount},${dataTotalMB},${dataUsedMB},${licenseType},${data},${collaborators},${formatDate(expiryDate)}\n`);
		});
	});

	writeStream.end(resolve);
});

module.exports = Utils;
