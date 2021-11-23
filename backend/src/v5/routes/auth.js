const Auth = require('../processors/auth');
const { Router } = require('express');
const { respond } = require('../utils/responder');
const { templates } = require('../utils/responseCodes');
const { validateLoginData, validateLogoutData } = require('../middleware/dataConverter/inputs/auth');
const { notValidSession, validSession } = require('../middleware/auth');
const config = require('../utils/config');

const login = (req, res) => {
	const { username, password} = req.body;

	Auth.login(username, password, req).then((user) => {
		respond(req, res, templates.ok, { user });
	}).catch((err) => respond(req, res, err));
};

const logout = (req, res) => {
	const username = req.session.user.username;

	req.session.destroy(function() {
		res.clearCookie("connect.sid", { domain: config.cookie_domain, path: "/" });
		respond(req, res, templates.ok, { username });
	});
};

const getUsername = (req, res) => {
	respond(req, res, templates.ok, { username: req.session.user.username });
};

const establishRoutes = () => {
	const router = Router({ mergeParams: true });

	router.post('/login', validateLoginData,notValidSession, login);
	router.post('/logout', validateLogoutData, validSession, logout);
	router.get('/login', validSession, getUsername);
	return router;
};

module.exports = establishRoutes();
