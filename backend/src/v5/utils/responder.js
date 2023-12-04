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

const { isBuffer, isString } = require('./helper/typeCheck');
const { createResponseCode } = require('./responseCodes');
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
	bin: 'application/octet-stream',
	json: 'application/json',
	png: 'image/png',
	jpg: 'image/jpg',
};

Responder.respond = (req, res, resCode, body, { cache, customHeaders, mimeType = Responder.mimeTypes.json } = {}) => {
	try {
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
			res.writeHead(finalResCode.status, customHeaders);
		} else {
			res.status(finalResCode.status);
		}

		if (isBuffer(body)) {
			const contentType = Responder.mimeTypes[req.params.format] || mimeType;
			res.setHeader('Content-Type', contentType);
			contentLength = body.length;
			res.write(body, 'binary');
			res.flush();
			res.end();
		} else {
			if (body) {
				contentLength = isString(body) ? body.length : JSON.stringify(body).length;
			}
			res.send(body);
		}
		logger.logInfo(genResponseLogging(resCode, contentLength, req));
	} catch (err) {
		logger.logError(`Unexpected error when sending a response ${err.message}`);
	}
};

Responder.writeStreamRespond = (req, res, resCode, readStream, fileName, fileSize, { mimeType } = {}) => {
	const headers = {
		'Content-Length': fileSize,
		'Content-Disposition': `attachment;filename=${fileName}`,
	};

	const contentType = Responder.mimeTypes[req.params.format] || mimeType;
	if (contentType) {
		headers['Content-Type'] = contentType;
	}
	let response = createResponseCode(resCode);

	readStream.on('error', (error) => {
		response = createResponseCode(error);
		logger.logInfo(genResponseLogging(response.code, fileSize, req));
		res.status(response.status);
		res.end();
	});

	readStream.once('data', () => {
		res.writeHead(response.status, headers);
	});

	readStream.on('data', (data) => {
		res.write(data);
	});

	readStream.on('end', () => {
		res.end();
		logger.logInfo(genResponseLogging(response.code, fileSize, req));
	});
};

module.exports = Responder;