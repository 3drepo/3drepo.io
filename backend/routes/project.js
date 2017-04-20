
(function() {
	"use strict";

	const express = require('express');
	const router = express.Router({mergeParams: true});
	const responseCodes = require('../response_codes');
	const middlewares = require('./middlewares');
	const Project = require("../models/project");
	const utils = require("../utils");

	router.post("/project-groups", middlewares.isAccountAdmin, createProject);
	router.put("/project-groups/:projectGroup", middlewares.isAccountAdmin, updateProject);
	router.delete("/project-groups/:projectGroup", middlewares.isAccountAdmin, deleteProject);


	function createProject(req, res, next){
		Project.createProject(req.params.account, req.body.name).then(project => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, project);
		}).catch(err => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});
	}


	function updateProject(req, res, next){

		Project.findOne({ account: req.params.account }, {name: req.params.projectGroup}).then(project => {
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
		
		Project.delete(req.params.account, req.params.projectGroup).then(project => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, project);
		}).catch(err => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});
	}

	module.exports = router;

}());

