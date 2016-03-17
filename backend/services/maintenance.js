/**
 *	Copyright (C) 2014 3D Repo Ltd
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

(function(){
	'use strict';
	
	let express = require('express');
	let app = express();

	app.engine('html', require('jade').renderFile);
	app.use(express.static('main'));
	app.set('view engine', 'html');
	app.set('views', 'main');

	app.get('/', function(req, res) {
		res.render('maintenance.jade');
	});

	app.listen(8080);

	let https_app = express();

	https_app.get('*', function(req, res) {
		res.redirect('http://' + req.headers.host + req.url);
	});

	https_app.listen(443);

})();


