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

const networkLabel = require('./logger').labels.network;
const logger = require('./logger').logWithLabel(networkLabel);
const { v4Path } = require('../../interop');
// eslint-disable-next-line import/no-dynamic-require, security/detect-non-literal-require
const { cachePolicy } = require(`${v4Path}/config`);
const { isBuffer, isString } = require('./helper/typeCheck');
const { template, codeExists, createResponseCode } = require('./responseCodes');

const Responder = {};

const constructApiInfo = ({ method, originalUrl }) => `${method} ${originalUrl}`;

const genResponseLogging = ({ status, code }, { contentLength }, { session, startTime, method, originalUrl } = {}) => {
	const user = session?.user ? session.user.username : 'unknown';
	const currentTime = Date.now();
	const latency = startTime ? `${currentTime - startTime}` : '???';
	return logger.formatResponseMsg({ status, code, latency, contentLength, user, method, originalUrl });
};

const createErrorResponse = (req, res, resCode) => {
	const resObj = {
		...resCode,
		place: constructApiInfo(req),
	};

	logger.logInfo(genResponseLogging(resCode, JSON.stringify(resObj).length, req));

	res.status(resCode.status).send(resObj);
};

const mimeTypes = {
	src: 'text/plain',
	gltf: 'application/json',
	bin: 'text/plain',
	json: 'application/json',
	png: 'image/png',
	jpg: 'image/jpg',
};

Responder.respond = (req, res, resCode, body, { cache, customHeaders } = {}) => {
	let finalResCode = resCode;
	if (!resCode?.code || !codeExists(resCode.code)) {
		// We don't recognise the response code. something went wrong.
		logger.logError('Unrecognised response code', resCode);
		finalResCode = createResponseCode(template.unknown);
	}

	if (finalResCode.status > 200) {
		createErrorResponse(req, res, finalResCode);
		return;
	}

	let contentLength;

	if (cache) {
		res.setHeader('Cache-Control', `private, max-age=${cachePolicy.maxAge}`);
	}

	if (customHeaders) {
		res.writeHead(resCode.status, customHeaders);
	}

	if (isBuffer(body)) {
		const contentType = mimeTypes[req.params.format] || 'application/json';
		res.setHeader('Content-Type', contentType);
		res.status(finalResCode.status);
		contentLength = body.length;
		res.write(body, 'binary');
		res.flush();
		res.end();
	} else {
		res.status(finalResCode.status);
		if (body) {
			contentLength = isString(body) ? body.length : JSON.stringify(body).length;
			res.send(body);
		}
	}
	logger.logInfo(genResponseLogging(resCode, contentLength, req));
};

module.exports = Responder;
