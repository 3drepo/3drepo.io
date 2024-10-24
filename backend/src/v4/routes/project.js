/**
 *  Copyright (C) 2014 3D Repo Ltd
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
(function() {

	const express = require("express");
	const router = express.Router({mergeParams: true});
	const responseCodes = require("../response_codes");
	const middlewares = require("../middlewares/middlewares");
	const Project = require("../models/project");
	const utils = require("../utils");

	/**
	 * @api {post} /:teamspace/projects Create project
	 * @apiName createProject
	 * @apiGroup Project
	 * @apiDescription It creates a project. The name of the project is required.
	 *
	 * @apiPermission canCreateProject
	 *
	 * @apiParam {String} teamspace Name of the teamspace
	 * @apiParam (Request body) {String} name The name of the project to be created
	 *
	 * @apiExample {post} Example usage:
	 * POST /teamSpace1/projects HTTP/1.1
	 * {name: "Classic project"}
	 *
	 * @apiSuccessExample {json} Success
	 * {
	 *    name: "Classic project",
	 *    _id: "5d5bec491c15383184eb7521",
	 *    permissions: [
	 *       "create_model",
	 *       "create_federation",
	 *       "admin_project",
	 *       "edit_project",
	 *       "delete_project",
	 *       "upload_files_all_models",
	 *       "edit_federation_all_models",
	 *       "create_issue_all_models",
	 *       "comment_issue_all_models",
	 *       "view_issue_all_models",
	 *       "view_model_all_models",
	 *       "download_model_all_models",
	 *       "change_model_settings_all_models"
	 *    ],
	 *    models: []
	 * }
	 *
	 */
	router.post("/projects", middlewares.project.canCreate, createProject);

	/**
	 * @api {put} /:teamspace/projects/:project Update project
	 * @apiName updateProjectPut
	 * @apiGroup Project
	 * @apiDescription It updates a project. The name can be changed and the permissions as well as the permissions of users
	 * @apiDeprecated use now (#Project:updateProject)
	 *
	 * @apiPermission canUpdateProject
	 *
	 * @apiParam {String} teamspace Name of the teamspace
	 * @apiParam {String} project The name of the project to update
	 * @apiParam (Request body) {String} name The name of the project to be created
	 * @apiParam (Request body) {[]Permission} permissions The permissions for each user from the project
	 *
	 * @apiParam (Request body: Permissions ) {String} user The username of the user to have it permission changed
	 * @apiParam (Request body: Permissions ) {String[]} permissions An array of permissions for the user to be assigned
	 *
	 * @apiExample {put} Example usage update permissions:
	 * PUT /teamSpace1/Classic%20project HTTP/1.1
	 * {
	 *    name: "Classic project",
	 *    permissions: [
	 *       {
	 *          user: "projectshared",
	 *          permissions: [
	 *             "admin_project"
	 *          ]
	 *       },
	 *       {
	 *          user: "viewerTeamspace1Model1JobA",
	 *          permissions: []
	 *       },
	 *       {
	 *          user: "commenterTeamspace1Model1JobB",
	 *          permissions: []
	 *       },
	 *       {
	 *          user: "collaboratorTeamspace1Model1JobA",
	 *          permissions: []
	 *       }
	 *    ]
	 * }
	 *
	 * @apiSuccessExample {json} Success update permissions:
	 * {
	 *    _id: "5d5bec491c15383184eb7521",
	 *    name: "Classic project",
	 *    permissions: [
	 *       {
	 *          user: "projectshared",
	 *          permissions: [
	 *             "admin_project"
	 *          ]
	 *       }
	 *    ],
	 *    models: []
	 * }
	 *
	 * @apiExample {put} Example usage rename project:
	 * PUT /teamSpace1/Classic%20project HTTP/1.1
	 * {name: "Classic project renamed"}
	 *
	 * @apiSuccessExample {json} Success rename project:
	 * {
	 *    _id: "5d5bec491c15383184eb7521",
	 *    name: "Classic project renamed",
	 *    permissions: [
	 *       {
	 *          user: "projectshared",
	 *          permissions: [
	 *             "admin_project"
	 *          ]
	 *       }
	 *    ],
	 *    models: []
	 * }
	 *
	 */
	router.put("/projects/:project", middlewares.project.canUpdate, changeProject);

	/**
	 * @api {patch} /:teamspace/projects/:project Update project
	 * @apiName updateProject
	 * @apiGroup Project
	 * @apiDescription Update project properties (name, permissions)
	 *
	 * @apiPermission canUpdateProject
	 *
	 * @apiParam {String} teamspace Name of teamspace
	 * @apiParam {String} project Name of project
	 * @apiParam (Request body) {String} [name] Project name
	 * @apiParam (Request body) {ProjectPermission[]} [permissions] List of user permissions
	 *
	 * @apiParam (Type: ProjectPermission) {String} user Username of user
	 * @apiParam (Type: ProjectPermission) {String[]} permissions List of user privileges
	 *
	 * @apiExample {patch} Example usage (update permissions):
	 * PATCH /acme/ProjectAnvil HTTP/1.1
	 * {
	 *    permissions: [
	 *       {
	 *          user: "alice",
	 *          permissions: [
	 *             "admin_project"
	 *          ]
	 *       },
	 *       {
	 *          user: "mike",
	 *          permissions: []
	 *       }
	 *    ]
	 * }
	 *
	 * @apiExample {patch} Example usage (rename project):
	 * PATCH /acme/ProjectAnvil HTTP/1.1
	 * {
	 *    name: "ProjectInstantTunnel"
	 * }
	 *
	 * @apiExample {patch} Example usage:
	 * PATCH /acme/ProjectInstantTunnel HTTP/1.1
	 * {
	 *    name: "Project Trebuchet",
	 *    permissions: [
	 *       {
	 *          user: "bob",
	 *          permissions: [
	 *             "admin_project"
	 *          ]
	 *       }
	 *    ]
	 * }
	 *
	 * @apiSuccessExample {json} Success-Response:
	 * {
	 *    status: "ok"
	 * }
	 */
	router.patch("/projects/:project", middlewares.project.canUpdate, updateProject);

	/**
	 * @api {get} /:teamspace/projects List projects
	 * @apiName listProjects
	 * @apiGroup Project
	 *
	 * @apiDescription It returns a list of projects with their permissions and model ids.
	 *
	 * @apiPermission canListProjects
	 *
	 * @apiParam {String} teamspace Name of the teamspace
	 *
	 * @apiExample {get} Example usage:
	 * GET /teamSpace1/projects HTTP/1.1
	 *
	 * @apiSuccessExample {json} Success:
	 * [
	 *    {
	 *       _id: "5ccb1490b4626d30c05c9401",
	 *       name: "Medieval",
	 *       permissions: [
	 *          {
	 *             user: "projectshared",
	 *             permissions: []
	 *          },
	 *          {
	 *             user: "fed",
	 *             permissions: []
	 *          },
	 *          {
	 *             user: "teamSpace1",
	 *             permissions: []
	 *          },
	 *          {
	 *             user: "weirdTeamspace",
	 *             permissions: []
	 *          }
	 *       ],
	 *       models: [
	 *          "50926a1f-1525-44ac-b6a1-d016949a13bb"
	 *       ]
	 *    },
	 *    {
	 *       _id: "5ccb1702b4626d30c05c9830",
	 *       name: "Bim Logo",
	 *       permissions: [
	 *          {
	 *             user: "projectshared",
	 *             permissions: []
	 *          },
	 *          {
	 *             user: "commenterTeamspace1Model1JobA",
	 *             permissions: []
	 *          },
	 *          {
	 *             user: "commenterTeamspace1Model1JobB",
	 *             permissions: []
	 *          },
	 *          {
	 *             user: "collaboratorTeamspace1Model1JobA",
	 *             permissions: []
	 *          },
	 *          {
	 *             user: "collaboratorTeamspace1Model1JobB",
	 *             permissions: []
	 *          },
	 *          {
	 *             user: "adminTeamspace1JobA",
	 *             permissions: []
	 *          },
	 *          {
	 *             user: "adminTeamspace1JobB",
	 *             permissions: []
	 *          },
	 *          {
	 *             user: "weirdTeamspace",
	 *             permissions: []
	 *          }
	 *       ],
	 *       models: [
	 *          "2710bd65-37d3-4e7f-b2e0-ffe743ce943f",
	 *          "b1fceab8-b0e9-4e45-850b-b9888efd6521",
	 *          "7cf61b4f-acdf-4295-b2d0-9b45f9f27418",
	 *          "5ce7dd19-1252-4548-a9c9-4a5414f2e0c5"
	 *       ]
	 *    },
	 *    {
	 *       _id: "5d5bec491c15383184eb7521",
	 *       name: "Classic project renamed",
	 *       permissions: [
	 *       {
	 *          user: "projectshared",
	 *          permissions: [
	 *             "admin_project"
	 *          ]
	 *       },
	 *       {
	 *          user: "viewerTeamspace1Model1JobA",
	 *          permissions: []
	 *       },
	 *       {
	 *          user: "commenterTeamspace1Model1JobB",
	 *          permissions: []
	 *       },
	 *       {
	 *          user: "collaboratorTeamspace1Model1JobA",
	 *          permissions: []
	 *       }
	 *    ],
	 *       models: []
	 *    }
	 * ]
	 *
	 */
	router.get("/projects", middlewares.project.canList, listProjects);

	/**
	 * @api {get} /:teamspace/projects/:project Get project
	 * @apiName listProject
	 * @apiGroup Project
	 *
	 * @apiDescription Get the details of a project; name, user permissions, modelids.
	 *
	 * @apiPermission canViewProject
	 *
	 * @apiParam {String} teamspace Name of the teamspace
	 * @apiParam {String} project Project name to be queried
	 *
	 * @apiExample {get} Example usage:
	 * GET /teamSpace1/projects/Classic%20project%20renamed HTTP/1.1
	 *
	 * @apiSuccessExample {json} Success:
	 * {
	 *    _id: "5d5bec491c15383184eb7521",
	 *    name: "Classic project renamed",
	 *    permissions: [
	 *       {
	 *          user: "projectshared",
	 *          permissions: [
	 *             "admin_project"
	 *          ]
	 *       },
	 *       {
	 *          user: "viewerTeamspace1Model1JobA",
	 *          permissions: []
	 *       },
	 *       {
	 *          user: "commenterTeamspace1Model1JobB",
	 *          permissions: []
	 *       },
	 *       {
	 *          user: "collaboratorTeamspace1Model1JobA",
	 *          permissions: []
	 *       }
	 *    ],
	 *    models: []
	 * }
	 */

	router.get("/projects/:project", middlewares.project.canView, listProject);

	/**
	 * @api {delete} /:teamspace/projects/:project Delete project
	 * @apiName deleteProject
	 * @apiGroup Project
	 *
	 * @apiDescription Deletes a project, including all the models and federations inside of it.
	 *
	 * @apiPermission canDeleteProject
	 *
	 * @apiParam {String} teamspace Name of the teamspace
	 * @apiParam {String} project Project to delete
	 *
	 * @apiExample {delete} Example usage:
	 * DELETE /teamSpace1/projects/Classic%20project%20renamed HTTP/1.1
	 *
	 * @apiSuccessExample {json} Success:
	 * {
	 *    _id: "5d5bec491c15383184eb7521",
	 *    name: "Classic project renamed",
	 *    permissions: [
	 *       {
	 *          user: "projectshared",
	 *          permissions: [
	 *             "admin_project"
	 *          ]
	 *       }
	 *    ],
	 *    models: []
	 * }
	 *
	 */
	router.delete("/projects/:project", middlewares.project.canDelete, deleteProject);

	function createProject(req, res, next) {
		Project.createProject(req.params.account, req.body.name, req.session.user.username,  req.session.user.permissions).then(project => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, project);
		}).catch(err => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});
	}

	function changeProject(req, res, next) {
		Project.updateAttrs(req.params.account, req.params.project, req.body).then(project => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, project);
		}).catch(err => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});
	}

	function updateProject(req, res, next) {
		Project.updateProject(req.params.account, req.params.project, req.body).then(project => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, project);
		}).catch(err => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});
	}

	function deleteProject(req, res, next) {
		Project.delete(req.params.account, req.params.project).then(project => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, project);
		}).catch(err => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});
	}

	function listProjects(req, res, next) {
		Project.listProjects(req.params.account).then(projects => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, projects);
		}).catch(err => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});
	}

	function listProject(req, res, next) {
		Project.getProjectUserPermissions(req.params.account, req.params.project).then(project => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, project);
		}).catch(err => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});
	}

	module.exports = router;

}());
