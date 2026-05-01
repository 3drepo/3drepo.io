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
const responseCodes = require("../response_codes.js");
const C = require("../constants");
const serialize = require("serialize-javascript");
const _ = require("lodash");
const addressMeta = require("../models/addressMeta");
const units = require("../models/unit");
const History = require("../models/history");
const ModelHelper = require("../models/helper/model");
const User = require("../models/user");
const DEFAULT_PLUGIN_STRUCTURE = require("../plugin/plugin-structure.js").DEFAULT_PLUGIN_STRUCTURE;
const utils = require("../utils");

const config = require("../config");

function createClientConfig(serverConfig, req) {

	// TODO: Replace with user based plugin selection
	let pluginStructure = {};

	// If the serverConfig has a plugin structure, use that
	// else just use the default
	if (serverConfig.pluginStructure) {
		pluginStructure = require("../../" + serverConfig.pluginStructure);
	} else {
		pluginStructure = DEFAULT_PLUGIN_STRUCTURE;
	}

	const clientConfig = {
		"maintenanceMode": config.maintenanceMode,
		"ui": {},
		"uistate": {},
		"structure": pluginStructure,
		"frontendPug": [],
		"development" : config.development,
		"gtm": config.gtm,
		"userNotice" : config.userNotice,
		"customLogins" : config.customLogins,
		"intercomLicense" : _.get(config, "intercom.license"),
		"apryseLicense": _.get(config, "apryse.licenseKey"),
		"resourceUploadSizeLimit" : config.resourceUploadSizeLimit,
		"sequencesEnabled": true,
		"presenterEnabled": true,
		"loginPolicy": config.loginPolicy
	};

	if (utils.hasField(config, "captcha_client_key")) {
		clientConfig.captcha_client_key = config.captcha_client_key;
	}

	// Set up the legal plugins
	if (utils.hasField(config, "legal")) {
		for (let i = 0; i < config.legal.length; i += 1) {
			pluginStructure.functions.push(config.legal[i].page);
		}
	}

	if (utils.hasField(config, "captcha_client_key")) {
		clientConfig.captcha_client_key = config.captcha_client_key;
	}

	if (req) {
		clientConfig.userId = _.get(req, "session.user.username");
	}

	// Set up the legal plugins
	clientConfig.legalTemplates = [];
	if (utils.hasField(config, "legal")) {
		clientConfig.legalTemplates = config.legal;
	}

	clientConfig.apiUrls = config.apiUrls;

	clientConfig.hotjar = config.hotjar;

	clientConfig.C = {
		GET_API : C.GET_API,
		POST_API : C.POST_API,
		MAP_API : C.MAP_API
	};

	if (config.chat_server) {
		clientConfig.chatHost = config.chat_server.chat_host;
		clientConfig.chatPath = "/" + config.chat_server.subdirectory;
	}

	clientConfig.chatReconnectionAttempts = config.chat_reconnection_attempts;

	clientConfig.VERSION = config.version;

	if (serverConfig.backgroundImage) {
		clientConfig.backgroundImage = serverConfig.backgroundImage;
	}

	clientConfig.return_path = "/";

	clientConfig.auth =  config.auth;

	if(config.captcha && config.captcha.clientKey) {
		clientConfig.captcha_client_key = config.captcha.clientKey;
	}

	clientConfig.uploadSizeLimit = config.uploadSizeLimit;
	clientConfig.imageSizeLimit = config.fileUploads.imageSizeLimit;
	clientConfig.imageExtensions = config.fileUploads.imageExtensions;
	clientConfig.countries = addressMeta.countries;
	clientConfig.euCountriesCode = addressMeta.euCountriesCode;
	clientConfig.usStates = addressMeta.usStates;
	clientConfig.units = units;
	clientConfig.legal = config.legal;
	clientConfig.tagRegExp = History.tagRegExp;
	clientConfig.modelNameRegExp = ModelHelper.modelNameRegExp;
	clientConfig.fileNameRegExp = C.FILENAME_REGEXP;
	clientConfig.usernameRegExp = User.usernameRegExp;
	clientConfig.acceptedFormat = C.ACCEPTED_FILE_FORMATS;
	clientConfig.login_check_interval = config.login_check_interval;

	clientConfig.responseCodes = _.each(responseCodes.codesMap);

	clientConfig.permissions = C.MODEL_PERM_OBJ;

	clientConfig.impliedPermission = C.IMPLIED_PERM;

	return clientConfig;
}

const clientConfig = createClientConfig(config);

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
