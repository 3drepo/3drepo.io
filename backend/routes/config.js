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
const Upload = require("../models/upload");
const User = require("../models/user");
const DEFAULT_PLUGIN_STRUCTURE = require("../plugin/plugin-structure.js").DEFAULT_PLUGIN_STRUCTURE;
const path = require("path");
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
		"resourceUploadSizeLimit" : config.resourceUploadSizeLimit,
		"sequencesEnabled": true,
		"presenterEnabled": true
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
	res.render(path.resolve(__dirname, "./../../resources/pug/config.pug"), {
		config: serializedConfig
	});
});

module.exports = router;
