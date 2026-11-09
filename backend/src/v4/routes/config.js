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

"use strict";

const express = require("express");
const router = express.Router({mergeParams: true});
const C = require("../constants");
const serialize = require("serialize-javascript");
const _ = require("lodash");

const utils = require("../utils");
const {v5Path} = require("../../interop.js");
const {
	isMaintenanceMode, isDevelopmentMode, getInterComConfig,
	getDataLimits, getApryseLicense, getAppVersion,
	getChatConfig, getImageExtensions,
	getModelFileExtensions, getCountriesListing
} = require(`${v5Path}/utils/config.js`);

function createClientConfig() {

	const intercomConfig = getInterComConfig();
	const dataLimits = getDataLimits();
	const chatConfig = getChatConfig();

	const clientConfig = {
		maintenanceMode: isMaintenanceMode(),
		development : isDevelopmentMode(),
		intercomLicense : intercomConfig.license,
		apryseLicense: getApryseLicense(),
		resourceUploadSizeLimit : dataLimits.resourceUploadSize,
		uploadSizeLimit: dataLimits.modelUploadSize,
		imageSizeLimit: dataLimits.imageSizeLimit,
		chatHost: chatConfig.host,
		chatPath: chatConfig.path,
		chatReconnectionAttempts: chatConfig.reconnectionAttempts,
		VERSION: getAppVersion(),
		imageExtensions: getImageExtensions(),
		acceptedFormat: getModelFileExtensions(),
		countries: getCountriesListing()

	};

	clientConfig.apiURL = config.apiUrls.all[0];

	return clientConfig;
}

const clientConfig = createClientConfig();

router.get("/version.json", function (req, res) {
	return res.json({"VERSION": clientConfig.VERSION });
});

router.get("/config.js", function (req, res) {

	// Only need to set the userId the rest is static
	clientConfig.userId = _.get(req, "session.user.username");

	// TODO: This used to be a long string concat,
	// this is marginally better but still a complete hack.
	// There is definitely a better way to do this
	const serializedConfig = serialize(clientConfig);

	res.header("Content-Type", "text/javascript");
	res.render(utils.getPugPath("config.pug"), {
		config: serializedConfig
	});
});

module.exports = router;
