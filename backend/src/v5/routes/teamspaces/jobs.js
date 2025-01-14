/**
 *  Copyright (C) 2022 3D Repo Ltd
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

const { hasAccessToTeamspace, isTeamspaceAdmin } = require('../../middleware/permissions/permissions');
const { jobExists, validateNewJob, validateUpdateJob } = require('../../middleware/dataConverter/inputs/teamspaces/jobs');

const Jobs = require('../../processors/teamspaces/jobs');
const { Router } = require('express');
const { UUIDToString } = require('../../utils/helper/uuids');
const { respond } = require('../../utils/responder');
const { templates } = require('../../utils/responseCodes');

const getJobList = async (req, res) => {
	const { teamspace } = req.params;

	try {
		const jobs = await Jobs.getJobList(teamspace);
		respond(req, res, templates.ok, { jobs });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const createJob = async (req, res) => {
	const { teamspace } = req.params;
	const job = req.body;

	try {
		const jobId = await Jobs.createJob(teamspace, job);
		respond(req, res, templates.ok, { _id: UUIDToString(jobId) });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const updateJob = async (req, res) => {
	const { teamspace, job } = req.params;
	const updatedJob = req.body;

	try {
		await Jobs.updateJob(teamspace, job, updatedJob);
		respond(req, res, templates.ok);
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const deleteJob = async (req, res) => {
	const { teamspace, job } = req.params;
	const updatedJob = req.body;

	try {
		await Jobs.deleteJob(teamspace, job, updatedJob);
		respond(req, res, templates.ok);
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const establishRoutes = () => {
	const router = Router({ mergeParams: true });
	/**
	* @openapi
	* /teamspaces/{teamspace}/jobs:
	*   get:
	*     description: Get the list of jobs within this teamspace
	*     tags: [Teamspaces]
	*     parameters:
	*       - name: teamspace
	*         description: name of teamspace
	*         in: path
	*         required: true
	*         schema:
	*           type: string
	*     operationId: jobList
	*     responses:
	*       401:
	*         $ref: "#/components/responses/notLoggedIn"
	*       200:
	*         description: Return the list of jobs within the teamspace
	*         content:
	*           application/json:
	*             schema:
	*               type: object
	*               properties:
	*                 jobs:
	*                   type: array
	*                   items:
	*                     type: object
	*                     properties:
	*                       _id:
	*                         type: string
	*                         description: Job name
	*                         example: Architect
	*                       color:
	*                         type: string
	*                         description: Color that represents the job, in hex
	*                         example: "#AA00BB"
	*/
	router.get('/', hasAccessToTeamspace, getJobList);

	/**
	* @openapi
	* /teamspaces/{teamspace}/jobs:
	*   post:
	*     description: Creates a new job
	*     tags: [Teamspaces]
	*     parameters:
	*       - name: teamspace
	*         description: name of teamspace
	*         in: path
	*         required: true
	*         schema:
	*           type: string
	*     requestBody:
	*       content:
	*         application/json:
	*           schema:
	*             type: object
	*             required:
	*               -name
	*             properties:
	*               name:
	*                 type: string
	*                 description: The name of the new job
	*                 example: Master Engineer
	*               color:
	*                 type: string
	*                 description: The color of the new job in RGB hex
	*                 example: #808080
	*               users:
	*                 type: array
	*                 description: The users the job is assigned to
	*                 items:
	*                   type: string
	*                   example: user1
	*     operationId: createJob
	*     responses:
	*       401:
	*         $ref: "#/components/responses/notLoggedIn"
	*       200:
	*         description: Create a new job
	*         content:
	*           application/json:
	*             schema:
	*               type: object
	*               properties:
	*                 _id:
	*                   type: string
	*                   format: uuid
	*                   description: The id of the new job
	*                   example: ef0857b6-4cc7-4be1-b2d6-c032dce7806a
	*/
	router.post('/', isTeamspaceAdmin, validateNewJob, createJob);

	/**
	* @openapi
	* /teamspaces/{teamspace}/jobs/{job}:
	*   patch:
	*     description: Updates a job
	*     tags: [Teamspaces]
	*     parameters:
	*       - name: teamspace
	*         description: name of teamspace
	*         in: path
	*         required: true
	*         schema:
	*           type: string
	*       - name: job
	*         description: id of the job
	*         in: path
	*         required: true
	*         schema:
	*           type: string
	*     requestBody:
	*       content:
	*         application/json:
	*           schema:
	*             type: object
	*             properties:
	*               name:
	*                 type: string
	*                 description: The updated name of the job
	*                 example: Master Engineer
	*               color:
	*                 type: string
	*                 description: The updated color of the job
	*                 example: #808080
	*               users:
	*                 type: array
	*                 description: The updated user list of the job
	*                 items:
	*                   type: string
	*                   example: user1
	*     operationId: updateJob
	*     responses:
	*       401:
	*         $ref: "#/components/responses/notLoggedIn"
	*       200:
	*         description: Updates a job
	*/
	router.patch('/:job', isTeamspaceAdmin, jobExists, validateUpdateJob, updateJob);

	/**
	* @openapi
	* /teamspaces/{teamspace}/jobs/{job}:
	*   delete:
	*     description: Deletes a job
	*     tags: [Teamspaces]
	*     parameters:
	*       - name: teamspace
	*         description: name of teamspace
	*         in: path
	*         required: true
	*         schema:
	*           type: string
	*       - name: job
	*         description: id of the job
	*         in: path
	*         required: true
	*         schema:
	*           type: string
	*     operationId: deleteJob
	*     responses:
	*       401:
	*         $ref: "#/components/responses/notLoggedIn"
	*       200:
	*         description: Deletes a job
	*/
	router.delete('/:job', isTeamspaceAdmin, jobExists, deleteJob);

	return router;
};

module.exports = establishRoutes();
