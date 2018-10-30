/**
 *	Copyright (C) 2018 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";

const config = require("../config.js");
const AWS = require("aws-sdk");

class S3Handler {
	constructor() {
		AWS.config.update({
			accessKeyId: config.s3.accessKey,
			secretAccessKey: config.s3.secretKey,
			region: config.s3.region
		});
		this.s3Conn = new AWS.S3();
	}

	getFile(key) {
		return this.s3Conn.getObject({Bucket : config.s3.bucketName, Key: key}).createReadStream();
	}
}

module.exports = new S3Handler();
