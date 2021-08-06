/**
 *  Copyright (C) 2018 3D Repo Ltd
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

const History = require("./history");
const { hasReadAccessToModelHelper } = require("../middlewares/middlewares");
const utils = require("../utils");
const { getRefNodes } = require("./ref");
const db = require("../handler/db");
const responseCodes = require("../response_codes");
const FileRef = require("./fileRef");

const SrcAssets = {};

const getAssetListFromRef = async (ref, username) => {
	try {
		if (await hasReadAccessToModelHelper(username, ref.owner, ref.project)) {
			const revInfo = await History.findLatest(ref.owner, ref.project, {_id: 1, coordOffset : 1});

			if (revInfo) {
				return await getAssetListEntry(ref.owner, ref.project, revInfo);
			}

		}
	} catch (err) {
		// ignore error from submodel. This could still be a value return.
	}
};

const getAssetListEntry = async (database, model, revInfo) => {
	const list = await db.find(database, model + ".stash.3drepo", {rev_id: revInfo._id, type: "mesh"}, { _id: 1});
	return {
		database,
		model,
		assets: list.map((meshEntry)=> utils.uuidToString(meshEntry._id)),
		offset: revInfo.coordOffset
	};

};

SrcAssets.getAssetList = async (account, model, branch, rev, username) => {
	const history = await  History.getHistory(account, model, branch, rev);

	if (!history) {
		throw responseCodes.INVALID_TAG_NAME;
	}

	const subModelRefs = await getRefNodes(account, model, branch, rev);

	const fetchPromise = subModelRefs.length ? subModelRefs.map((ref) => getAssetListFromRef(ref, username))
		: [getAssetListEntry(account, model, history)];

	// remove undefined entries
	const models = (await Promise.all(fetchPromise)).filter(data => !!data);

	return {models};
};

SrcAssets.getSRC = (account, model, id) => {
	return FileRef.getSRCFile(account, model, `${id}.src.mpc`);
};

module.exports = SrcAssets;
