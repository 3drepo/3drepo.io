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

const Yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const Utils = {};

const { argv } = Yargs(hideBin(process.argv));

const includeTS = argv.includeTS ? argv.includeTS.split(',') : [];
const excludeTS = argv.excludeTS ? argv.excludeTS.split(',') : [];

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

module.exports = Utils;
