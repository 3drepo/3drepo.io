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
const https = require("https");

const httpsAgent = new https.Agent({keepAlive:true});

function parseUrl(url) {

	const urlPart = {};

	let parsedUrl = url.split("://");

	if(parsedUrl.length === 1) {
		throw new Error("Malformed URL");
	}

	urlPart.protocol = parsedUrl.shift();

	parsedUrl = parsedUrl[0].split("/");
	const host =  parsedUrl.shift().split(":");
	urlPart.host = host[0];

	urlPart.port = host[1] || urlPart.protocol === "https" ? 443 : 80;
	urlPart.path = "/" + parsedUrl.join("/");

	return urlPart;
}

function get(hostname, path) {

	const options = {
		hostname,
		path,
		agent: httpsAgent
	};
	return new Promise((resolve, reject) => {
		https.get(options, result => {
			// console.log(url + qs);
			// Buffer the body entirely for processing as a whole.

			// console.log(result.headers);

			const bodyChunks = [];
			result.on("data", function(chunk) {
				bodyChunks.push(chunk);
			}).on("end", function() {
				let body = Buffer.concat(bodyChunks);

				// console.log(result.headers['content-type']);
				if(result.headers["content-type"].startsWith("application/json")) {
					body = JSON.parse(body);
				}

				if([200, 201].indexOf(result.statusCode) === -1) {
					reject({resCode : result.statusCode, message: result.statusMessage});
				} else {
					resolve(body);
				}

			});

		}).on("error", function(e) {
			reject(e);
		});
	});

}

function makePostData(obj) {

	const params = [];

	Object.keys(obj).forEach(key => {
		params.push(`${key}=${encodeURIComponent(obj[key])}`);
	});

	return params.join("&");
}

function post(url, obj, type) {

	if(!type) {
		type = "application/x-www-form-urlencoded";
	}

	let stringify = makePostData;

	if(type === "application/json") {
		stringify = JSON.stringify;
	}

	let stringifiedData;

	if(typeof obj === "string") {
		stringifiedData = obj;
	} else {
		stringifiedData = stringify(obj);
	}

	const parsedUrl = parseUrl(url);

	const options = {
		hostname: parsedUrl.host,
		port: parsedUrl.port,
		path: parsedUrl.path,
		method: "POST",
		headers: {
			"Content-Type": type,
			"Content-Length": stringifiedData.length
		}
	};

	return new Promise((resolve, reject) => {

		const req = https.request(options, (res) => {

			const bodyChunks = [];

			res.on("data", (chunk) => {
				bodyChunks.push(chunk);
			}).on("end", () => {

				let body = Buffer.concat(bodyChunks);

				if(res.headers["content-type"].startsWith("application/json")) {
					body = JSON.parse(body);
				} else {
					body = body.toString();
				}

				if([200, 201].indexOf(res.statusCode) === -1) {
					reject(body);
				} else {
					resolve(body);
				}

			});
		}).on("error", err => {
			reject(err);
		});

		req.write(stringifiedData);
		req.end();
	});

}

module.exports = {
	get: get,
	post: post,
	querystring: makePostData
};

