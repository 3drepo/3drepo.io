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

/***************************************************************************
*  @file Contains the POST routes
****************************************************************************/

var schemaValidator = require('./js/core/db_schema.js')();
var log_iface = require('./js/core/logger.js');
var logger = log_iface.logger;
var responseCodes = require('./js/core/response_codes.js');
var config = require('./js/core/config.js');
var queue = require('./js/core/queue.js');
var multer = require('multer');


function createSession(place, res, req, user)
{
	req.session.regenerate(function(err) {
		if(err)
			responseCodes.respond(place, responseCodes.EXTERNAL_ERROR(err), res, {account: user.username});
		else
	{	
			logger.log('debug', 'Authenticated ' + user.username + ' and signed token.')
			req.session.user = user;
			responseCodes.respond(place, responseCodes.OK, res, {account: user.username});
		}
	});
}

module.exports = function (router, dbInterface, checkAccess) {
    this.postMap = [];
    
    this.post = function (regex, shouldCheckAccess, callback) {
        this.postMap.push({ regex: regex, shouldCheckAccess: shouldCheckAccess, callback: callback });
    };
    
    // Log the user into the API
    this.post('/login', false, function (req, res) {
        var responsePlace = "Login POST";
        
        this.dbInterface.authenticate(req.body.username, req.body.password, function (err, user) {
            logger.log('debug', 'Attempting to log user ' + req.body.username);
            
            if (err.value) {
                console.log("MESSAGE: " + err.message);
                responseCodes.respond(responsePlace, err, res, { account: req.body.username });
            } else {
                if (user) {
                    createSession(responsePlace, res, req, user);
                } else {
                    responseCodes.respond(responsePlace, responseCodes.USER_NOT_FOUND, res, { account: req.body.username });
                }
            }
        });
    });
    
    // Log the user out of the API
    this.post('/logout', false, function (req, res) {
        if (!req.session.user) {
            return responseCodes.respond("Logout POST", responseCodes.NOT_LOGGED_IN, res, {});
        }
        
        var username = req.session.user.username;
        
        req.session.destroy(function () {
            logger.log('debug', 'User ' + username + ' has logged out.')
            
            responseCodes.respond("Logout POST", responseCodes.OK, res, { account: username });
        });
    });
    
    // Update or create a user's account
    this.post('/:account', false, function (req, res) {
        var responsePlace = "Account POST";
        
        logger.log("debug", "Trying to affect user" + req.params["account"]);
        
        this.dbInterface.getUserInfo(req.params["account"], false, function (err, user) {
            if (!user) {
                // Trying to sign-up
                logger.log("debug", "Trying to add user " + req.params["account"]);
                this.dbInterface.createUser(req.params["account"], req.body.password, req.body.email, function (err) {
                    createSession(responsePlace, res, req, req.params["account"]);
                });
            } else {
                if (!req.session.user) {
                    return responseCodes.respond(responsePlace, responseCodes.NOT_LOGGED_IN, res, {});
                }
                
                if (req.session.user.username != req.params['account']) {
                    responseCodes.respond(responsePlace, responseCodes.NOT_AUTHORIZED, res, { account: req.params["account"] });
                } else {
                    // Modify account here
                    logger.log("debug", "Updating account for " + req.params["account"]);
                    
                    if (req.body.oldPassword) {
                        this.dbInterface.updatePassword(req.params["account"], req.body, function (err) {
                            responseCodes.onError(responsePlace, err, res, { account: req.params["account"] });
                        });
                    } else {
                        this.dbInterface.updateUser(req.params["account"], req.body, function (err) {
                            responseCodes.onError(responsePlace, err, res, { account: req.params["account"] });
                        });
                    }
                }
            }
        });
    });
    
    
    //upload and import file into repo world
    this.post('/:account/:project/upload', true, function (req, res) {
        var responsePlace = 'Uploading a new model';
        if (config.cn_queue) {
            var upload = multer({ dest: config.cn_queue.upload_dir });
            upload.single('file')(req, res, function (err) {
                if (err) {
                    logger.log('debug', 'error: ' + err);
                }
                else {
                    console.log("session: " , req.session);
                    queue.importFile(req.file.path, req.file.originalname, req.params["account"], req.params["project"], req.session.user, function (err) {
                        logger.log("debug", "callback of importfile: " + err);
                        responseCodes.onError(responsePlace, err, res, { "user": req.session.user.username, "database" : req.params["account"], "project": req.params["project"] });

                    });
                }
            });
        }
        else {
            responseCodes.onError(responsePlace, responseCodes.QUEUE_NO_CONFIG, res, { "user": req.session.user.username, "database" : req.params["account"], "project": req.params["project"] });
        }

    });

	// Update or create a user's account
	//this.post('/:account/:project', false, function(req, res) {
	//});

	this.post('/:account/:project/wayfinder/record', false, function(req, res) {
		var resCode = responseCodes.OK;
		var responsePlace = 'Wayfinder record POST';

		logger.log('debug', 'Posting wayfinder record information');

		console.log(JSON.stringify(req.session));

		if (!("user" in req.session)) {
			responseCodes.respond('Wayfinder record POST', responseCodes.NOT_LOGGED_IN, res, {});
		} else {
			var data = JSON.parse(req.body.data);
			var timestamp = JSON.parse(req.body.timestamp);

			this.dbInterface.storeWayfinderInfo(req.params["account"], req.params["project"], req.session.user.username, req.sessionID, data, timestamp, function(err) {
				responseCodes.onError('Wayfinder record POST', err, res, {});
			});
		}

	});

    self.post("/:account/:project/walkthrough", false, function(req, res) {
        if (!("user" in req.session)) {
            responseCodes.respond("Walkthrough record POST", responseCodes.NOT_LOGGED_IN, res, {});
        }
        else {
            self.dbInterface.storeWalkthroughInfo(req.params.account, req.params.project, req.body, function(err) {
                responseCodes.onError("Walkthrough record POST", err, res, {});
            });
        }

    });

	// Ability to add a named viewpoint
	this.post('/:account/:project/:branch/viewpoint', true, function(req, res) {
		var responsePlace = 'Adding a viewpoint';

		logger.log('debug', 'Adding a new viewpoint to ' + req.params["account"] + req.params["project"]);

		var data = JSON.parse(req.body.data);

		this.dbInterface.getRootNode(req.params["account"], req.params["project"], req.params["branch"], null, function(err, root) {
			if (err.value) return callback(err);

			console.log(JSON.stringify(root));

			this.dbInterface.storeViewpoint(req.params["account"], req.params["project"], req.params["branch"], req.session.user, this.dbInterface.uuidToString(root["shared_id"]), data, function(err) {
				responseCodes.onError(responsePlace, err, res, {});
			});
		});
	});

	this.post('/:account/:project/issues/:sid', true, function(req, res) {
		var responsePlace = 'Adding or updating an issue';
		var data = JSON.parse(req.body.data);

		logger.log('debug', 'Upserting an issues for object ' + req.params['sid'] + ' in ' + req.params["account"] + '/' + req.params["project"]);

		this.dbInterface.storeIssue(req.params["account"], req.params["project"], req.params["sid"], req.session.user.username, data, function(err, result) {
			responseCodes.onError(responsePlace, err, res, result);
		});
	});


	// Register handlers with Express Router
	for(var idx in this.postMap)
	{
		var item = this.postMap[idx];

		console.log('debug', 'Adding POST call for ' + item['regex']);

		var resFunction = schemaValidator.validate(item.regex);

		if (item.shouldCheckAccess)
			router.post(item.regex.toString(), resFunction, checkAccess, item.callback);
		else
			router.post(item.regex, resFunction, item.callback);
	}

	return this;
};
