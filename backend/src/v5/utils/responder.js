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

const { createResponseCode, templates } = require('./responseCodes');
const { isBuffer, isString } = require('./helper/typeCheck');
const networkLabel = require('./logger').labels.network;
const logger = require('./logger').logWithLabel(networkLabel);
const { v4Path } = require('../../interop');
// eslint-disable-next-line import/no-dynamic-require, security/detect-non-literal-require, require-sort/require-sort
const { cachePolicy } = require(`${v4Path}/config`);

const Responder = {};

const constructApiInfo = ({ method, originalUrl }) => `${method} ${originalUrl}`;

const genResponseLogging = ({ status, code }, contentLength, { session, startTime, method, originalUrl } = {}) => {
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

Responder.mimeTypes = {
	src: 'text/plain',
	gltf: 'application/json',
	bin: 'text/plain',
	json: 'application/json',
	png: 'image/png',
	jpg: 'image/jpg',
};

Responder.respond = (req, res, resCode, body, { cache, customHeaders, mimeType = Responder.mimeTypes.json } = {}) => {
	const finalResCode = createResponseCode(resCode);

	if (finalResCode.status > 200) {
		createErrorResponse(req, res, finalResCode);
		return;
	}

	let contentLength = 0;

	if (cache) {
		res.setHeader('Cache-Control', `private, max-age=${cachePolicy.maxAge}`);
	}

	if (customHeaders) {
		res.writeHead(resCode.status, customHeaders);
	}

	if (isBuffer(body)) {
		const contentType = Responder.mimeTypes[req.params.format] || mimeType;
		res.setHeader('Content-Type', contentType);
		res.status(finalResCode.status);
		contentLength = body.length;
		res.write(body, 'binary');
		res.flush();
		res.end();
	} else {
		if (body) {
			contentLength = isString(body) ? body.length : JSON.stringify(body).length;
		}
		res.status(finalResCode.status).send(body);
	}
	logger.logInfo(genResponseLogging(resCode, contentLength, req));
};

Responder.writeStreamRespond = (req, res, resCode, readStream, fileName, fileSize) => {
	const headers = {
		'Content-Length': fileSize,
		'Content-Disposition': `attachment;filename=${fileName}`,
	};

	let response = createResponseCode(resCode);
	const place = `${req.method} ${req.originalUrl}`;

	readStream.on('error', (error) => {
		logger.logError(`Stream failed: [${error.code} - ${error.message}] @ ${place}`, undefined, networkLabel);
		response = templates.unknown;
		res.status(response.status);
		res.end();
	});
	
	readStream.once('data', () => {
		if (headers) {
			res.writeHead(response.status, headers);
		} else {
			res.status(response.status);
		}
	});

	readStream.on('data', (data) => {
		res.write(data);
	});
	
	readStream.on('end', () => {
		res.end();
		logger.logInfo(genResponseLogging(response, {
			place,
			httpCode: response.status,
			contentLength: fileSize,
		}, req), undefined, networkLabel);
	});
};

module.exports = Responder;
