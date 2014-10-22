var express = require('express');
var bCrypt = require('bcrypt-nodejs');
var log_iface = require('./js/core/logger.js');
var logger = log_iface.logger;
var db_interface = require('./js/core/db_interface.js');
var x3dom_encoder = require('./js/core/x3dom_encoder.js');
var router = express.Router();
var interface = require('./js/core/interface.js');

var isAuth = function(req, res, next) {
	logger.log('debug', 'Authenticated: ' + req.isAuthenticated());

	if (req.isAuthenticated())
		return next();

	res.redirect('/');
}

module.exports = function(passport)
{
	router.use(express.static('./submodules'));
	router.use(express.static('./public'));

	// Login routes
	router.get('/', function(req, res) {
		res.render('login', { message: req.flash('message') });
	});

	router.post('/login', passport.authenticate('login', {
		successRedirect: '/3drepoio/sphere',
		failureRedirect: '/',
		failureFlash: true
	}));

	/*
	   TODO: Fix change password
	router.get('/password', function(req, res) {
		res.render('password', {message: req.flash('message')});
	});

	router.post('/password', passport.authenticate('password', {
		successRedirect: '/3drepoio/sphere',
		failureRedirect: '/login',
		failureFlash: true
	}));
	*/

	router.get('/3drepoio/:db_name.:subformat.:format/:revision?', isAuth, function(req, res, next) {
		logger.log('debug', 'Opening scene ' + req.param('db_name'));
		x3dom_encoder.render(db_interface, req.param('db_name'), req.param('format'), req.param('subformat'), null, req.param('revision'), null, null, res, function(err) {
			onError(err);
		});
	});

	router.get('/data/src_bin/:db_name/:uuid/level:lvl.pbf', isAuth, function(req, res, next) {
		x3dom_encoder.render(db_interface, req.param('db_name'), 'pbf', null, req.param('lvl'), null, req.param('uuid'), null, res, function(err) {
			onError(err);
		});
	});

	router.get('/data/:db_name/textures/:uuid.:format', isAuth, function(req, res, next) {
		x3dom_encoder.get_texture(db_interface, req.param('db_name'), req.param('uuid'), res, function(err) {
			onError(err);
		});
	});

	router.get('/data/:db_name/:type/:uuid.bin', isAuth, function(req, res, next) {
		x3dom_encoder.get_mesh_bin(db_interface, req.param('db_name'), req.param('uuid'), req.param('type'), res, function(err) {
			onError(err);
		});
	});

	router.get('/data/src_bin/:db_name/:uuid.:format/:texture?', isAuth, function(req, res, next) {
		logger.log('debug', 'Requesting mesh ' + req.param('uuid') + ' ' + req.param('texture'));
		x3dom_encoder.render(db_interface, req.param('db_name'), req.param('format'), null, null, null, req.param('uuid'), req.param('texture'), res, function(err) {
			onError(err);
		});
	});

	router.get('/3drepoio/:db_name/:revision?', isAuth, function(req, res, next) {
		logger.log('debug', 'Opening scene ' + req.param('db_name'));
		interface.index('index', req.param('db_name'), 'src', req.param('revision'), res, function(err)
		{
			onError(err);
		});
	});

	router.get('/bid4free/:db_name', isAuth, function(req, res, next) {
		logger.log('debug', 'Opening scene ' + req.param('db_name'));

		interface.index('bid4free', db_name, 'src', revision, res, function(err)
		{
			onError(err);
		});
	});


	router.get('*', function(req, res) {
		logger.log('debug', 'Un-routed URL : ' + req.url);
		res.redirect('/');
	});

	return router;
}
