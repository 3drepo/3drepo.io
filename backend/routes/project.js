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

(function() {
	"use strict";

	const express = require('express');
	const router = express.Router({mergeParams: true});
	const responseCodes = require('../response_codes');
	const middlewares = require('../middlewares/middlewares');
	const Project = require("../models/project");
	const utils = require("../utils");
	
	router.post("/projects", middlewares.project.canCreate, createProject);
	router.put("/projects/:project", middlewares.project.canUpdate, updateProject);
	router.get("/projects", middlewares.project.canList, listProjects);
	router.get("/projects/:project",  middlewares.project.canView, listProject);
	router.delete("/projects/:project", middlewares.project.canDelete, deleteProject);


	function createProject(req, res, next){
		Project.createProject(req.params.account, req.body.name, req.session.user.username,  req.session.user.permissions).then(project => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, project);
		}).catch(err => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});
	}


	function updateProject(req, res, next){

		Project.findOne({ account: req.params.account }, {name: req.params.project}).then(project => {
			if(!project){
				return Promise.reject(responseCodes.PROJECT_NOT_FOUND);
			} else {
				return project.updateAttrs(req.body);
			}
		}).then(project => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, project);
		}).catch(err => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});
	}

	function deleteProject(req, res, next){
		
		Project.delete(req.params.account, req.params.project).then(project => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, project);
		}).catch(err => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});
	}

	function listProjects(req, res, next){
		Project.findAndPopulateUsers({ account: req.params.account }, {}).then(projects => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, projects);
		}).catch(err => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});
	}

	function listProject(req, res, next){

		Project.findOneAndPopulateUsers({ account: req.params.account }, {name: req.params.project}).then(project => {
			
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, project);

		}).catch(err => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});
	}

	module.exports = router;

}());
