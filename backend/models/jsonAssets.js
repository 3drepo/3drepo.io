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

const FileRef = require("./fileRef");
const History = require("./history");
const utils = require("../utils");
const Ref = require("./ref");
const C = require("../constants");
const ResponseCodes = require("../response_codes");
const Stream = require("stream");

const JSONAssets = {};

JSONAssets.getSuperMeshMapping = function(account, model, id) {
	const name = `${id}.json.mpc`;
	return FileRef.getJSONFile(account, model, name).then((file) => {
		file.fileName = name;
		return file;
	});
};

function getSubTreeInfo(account, model, currentIds) {
	return Ref.getRefNodes(account, model, currentIds).then((subModelRefs) => {
		const subTreeInfo = [];
		subModelRefs.forEach((ref) => {
			const url = utils.uuidToString(ref._rid) !== C.MASTER_BRANCH ?
				`/${ref.owner}/${ref.project}/revision/${ref._rid}/fulltree.json` :
				`/${ref.owner}/${ref.project}/revision/master/head/fulltree.json`;
			subTreeInfo.push({
				_id: utils.uuidToString(ref._id),
				url,
				model: ref.project});
		});
		return subTreeInfo;
	});
}

JSONAssets.getTree = function(account, model, branch, rev) {
	return History.getHistory({ account, model }, branch, rev).then((history) => {
		if(history) {
			const revId = utils.uuidToString(history._id);
			const treeFileName = `${revId}/fulltree.json`;
			const mainTreePromise = FileRef.getJSONFile(account, model, treeFileName);
			const subTreesPromise = getSubTreeInfo(account, model, history.current);

			return mainTreePromise.then((file) => {
				const outStream = Stream.PassThrough();
				const readStream = file.readStream;
				file.readStream = outStream;
				delete file.size;
				new Promise(function(resolve) {
					outStream.write("{\"mainTree\": ");
					readStream.on("data", d => outStream.write(d));
					readStream.on("end", ()=> resolve());
					readStream.on("error", err => outStream.emit("error", err));
				}).then(() => {
					return subTreesPromise.then((subTreeInfo) => {
						outStream.write(", \"subTrees\":[");
						for(let i = 0; i < subTreeInfo.length; ++i) {
							if(subTreeInfo[i]) {
								if(i > 0) {
									outStream.write(",");
								}
								outStream.write(JSON.stringify(subTreeInfo[i]));
							}
						}
						outStream.write("]}");
						outStream.end();
					});

				}).catch((err) => {
					outStream.emit("error", err);
					outStream.end();
				});
				return file;

			});
		} else {
			return Promise.reject(ResponseCodes.INVALID_TAG_NAME);
		}
	});
};

module.exports = JSONAssets;
