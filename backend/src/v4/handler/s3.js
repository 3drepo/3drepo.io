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

const config = require("../config.js");
const responseCodes = require("../response_codes.js");
const systemLogger = require("../logger.js").systemLogger;
const AWS = {}; // require("aws-sdk"); - uncomment and add aws-sdk to package.json to revive.
const https = require("https");

class S3Handler {
	constructor() {
		if(AWS.config) {
			if (config.s3 &&
				config.s3.accessKey &&
				config.s3.secretKey &&
				config.s3.bucketName &&
				config.s3.region) {
				const agent = new https.Agent({
					maxSockets: 1000
				});

				AWS.config.update({
					accessKeyId: config.s3.accessKey,
					secretAccessKey: config.s3.secretKey,
					region: config.s3.region,
					httpOptions:{
						agent: agent
					}
				});
				this.s3Conn = new AWS.S3();
				this.testConnection();
			} else {
				systemLogger.logError("S3 is not configured.");
				throw new Error("S3 is not configured");
			}
		}
	}

	getFileStream(key) {
		return this.s3Conn ?
			this.s3Conn.getObject({Bucket : config.s3.bucketName, Key: key}).createReadStream() :
			Promise.reject(responseCodes.UNSUPPORTED_STORAGE_TYPE);
	}

	getFile(key) {
		return this.s3Conn ?
			this.s3Conn.getObject({Bucket : config.s3.bucketName, Key: key}).promise().then((file) => file.body) :
			Promise.reject(responseCodes.UNSUPPORTED_STORAGE_TYPE);
	}

	removeFiles(keys) {
		const delList = keys.map((item) => {
			return { Key: item};
		});
		const params = { Delete: {Objects: delList}, Bucket: config.s3.bucketName };
		return this.s3Conn ?
			this.s3Conn.deleteObjects(params).promise() :
			Promise.reject(responseCodes.UNSUPPORTED_STORAGE_TYPE);
	}

	testConnection() {
		return this.s3Conn.headBucket({Bucket: config.s3.bucketName}, (err) => {
			if(err) {
				systemLogger.logError("failed to connect to S3: ", err);
				throw new Error("S3 connection failed");
			}
		});
	}
}

module.exports = new S3Handler();
