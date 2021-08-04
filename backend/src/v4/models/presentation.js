/**
 *  Copyright (C) 2014 3D Repo Ltd
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
const db = require("../handler/db");

const ChatEvent = require("./chatEvent");
const { INVALID_STREAM_SESSION } = require("../response_codes.js");

const Presentation = {};

const generateCode = () => {
	let code = "";
	for (let i = 0; i < 5; i++) {
		let val = Math.round(Math.random() * 51);

		if (val > 25) {
			val += 6;
		}

		code += String.fromCharCode(val + 65);
	}

	return code;
};

Presentation.startPresenting = async (teamspace, model, user) => {
	const code = generateCode();
	await db.updateOne(teamspace, model + ".presentations", { user }, { $set: { user, code}}, true);
	return code;
};

Presentation.validateStream = async (teamspace , model, user, code) => {
	const res = await db.findOne(teamspace, model + ".presentations", { user, code });
	return Boolean(res);
};

Presentation.streamPresentation = async (teamspace , model, user, code, viewpoint, sessionId) => {
	if (! await (Presentation.validateStream(teamspace, model, user, code))) {
		throw {resCode: INVALID_STREAM_SESSION};
	}

	return await ChatEvent.streamPresentation(sessionId, teamspace , model, code, viewpoint);
};

Presentation.endPresentation = async (teamspace , model, user, code, sessionId) => {
	if (! await (Presentation.validateStream(teamspace, model, user, code))) {
		throw {resCode: INVALID_STREAM_SESSION};
	}

	await db.deleteOne(teamspace, model + ".presentations", { user, code });
	return await ChatEvent.endPresentation(sessionId, teamspace , model, code);
};

Presentation.exists = async (teamspace, model, code) => {
	const res = await db.findOne(teamspace, model + ".presentations", { code });
	return Boolean(res);
};

module.exports =  Presentation;
