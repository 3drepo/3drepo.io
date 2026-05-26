/**
 *  Copyright (C) 2023 3D Repo Ltd
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

const {
	addComment: addConComment,
	deleteComment: deleteConComment,
	getCommentById: getConComment,
	getCommentsByTicket: getConComments,
	updateComment: updateConComment,
} = require('../../../../../processors/teamspaces/projects/models/containers');
const {
	addComment: addFedComment,
	deleteComment: deleteFedComment,
	getCommentById: getFedComment,
	getCommentsByTicket: getFedComments,
	updateComment: updateFedComment,
} = require('../../../../../processors/teamspaces/projects/models/federations');
const { canUpdateComment, validateNewComment, validateUpdateComment } = require('../../../../../middleware/dataConverter/inputs/teamspaces/projects/models/commons/tickets.comments');
const {
	hasCommenterAccessToContainer,
	hasCommenterAccessToFederation,
	hasReadAccessToContainer,
	hasReadAccessToFederation,
} = require('../../../../../middleware/permissions');
const { serialiseComment, serialiseCommentList } = require('../../../../../middleware/dataConverter/outputs/teamspaces/projects/models/commons/tickets.comments');

const { Router } = require('express');
const { UUIDToString } = require('../../../../../utils/helper/uuids');
const { checkTicketExists } = require('../../../../../middleware/dataConverter/inputs/teamspaces/projects/models/commons/tickets');
const { getUserFromSession } = require('../../../../../utils/sessions');
const { respond } = require('../../../../../utils/responder');
const { templates } = require('../../../../../utils/responseCodes');
const { validateListSortAndFilter } = require('../../../../../middleware/dataConverter/inputs/teamspaces/projects/models/commons/utils');

const getComment = (isFed) => async (req, res, next) => {
	const { params } = req;
	const { teamspace, project, model, ticket, comment } = params;

	try {
		const getCommentById = isFed ? getFedComment : getConComment;

		req.commentData = await getCommentById(teamspace, project, model, ticket, comment);
		await next();
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const getAllComments = (isFed) => async (req, res, next) => {
	const { params, listOptions } = req;
	const { teamspace, project, model, ticket } = params;

	try {
		const getCommentsByTicket = isFed ? getFedComments : getConComments;

		const comments = await getCommentsByTicket(teamspace, project, model, ticket, listOptions);
		req.comments = comments;
		await next();
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const createComment = (isFed) => async (req, res) => {
	const { params, body: commentData } = req;
	const { teamspace, project, model, ticket } = params;
	const user = getUserFromSession(req.session);

	try {
		const createComm = isFed ? addFedComment : addConComment;
		const _id = await createComm(teamspace, project, model, ticket, commentData, user);
		respond(req, res, templates.ok, { _id: UUIDToString(_id) });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const updateComment = (isFed) => async (req, res) => {
	const { params, body: updateData, commentData } = req;
	const { teamspace, project, model, ticket } = params;

	try {
		const updateComm = isFed ? updateFedComment : updateConComment;
		await updateComm(teamspace, project, model, ticket, commentData, updateData);

		respond(req, res, templates.ok);
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const deleteComment = (isFed) => async (req, res) => {
	const { params, commentData } = req;
	const { teamspace, project, model, ticket } = params;
	try {
		const deleteComm = isFed ? deleteFedComment : deleteConComment;
		await deleteComm(teamspace, project, model, ticket, commentData);

		respond(req, res, templates.ok);
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const establishRoutes = (isFed) => {
	const router = Router({ mergeParams: true });
	const hasReadAccess = isFed ? hasReadAccessToFederation : hasReadAccessToContainer;
	const hasCommenterAccess = isFed ? hasCommenterAccessToFederation : hasCommenterAccessToContainer;

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/{type}/{model}/tickets/{ticket}/comments/{comment}:
	 *   get:
	 *     description: Get the details of a comment
	 *     tags: [v:external, Tickets]
	 *     operationId: getComment
	 *     parameters:
	 *       - name: teamspace
	 *         description: Name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: project
	 *         description: Project ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: type
	 *         description: Model type
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           enum: [containers, federations]
	 *       - name: model
	 *         description: Container/Federation ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: ticket
	 *         description: Ticket ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: comment
	 *         description: Comment ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/teamspaceNotFound"
	 *       200:
	 *         description: comment have been successfully retrieved
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 _id:
	 *                   type: string
	 *                   format: uuid
	 *                   description: The ID of the comment
	 *                   example: ef0855b6-4cc7-4be1-b2d6-c032dce7806a
	 *                 message:
	 *                   type: string
	 *                   example: Example message
	 *                   description: Content of the comment
	 *                 images:
	 *                   type: array
	 *                   description: The images of the comment
	 *                   items:
	 *                     type: string
	 *                     format: uuid
	 *                     description: The Id of the comment image
	 *                     example: ef0855b6-4cc7-4be1-b2d6-c032dce7806a
	 *                 view:
	 *                   $ref: "#components/schemas/ticketCommentView"
	 *                 history:
	 *                   type: array
	 *                   description: The update history of the comment
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       timestamp:
	 *                         type: number
	 *                         example: 1632821119000
	 *                         description: Timestamp of the update
	 *                       message:
	 *                         type: string
	 *                         example: Example message
	 *                         description: The content of the comment
	 *                       images:
	 *                         type: array
	 *                         description: The images of the comment
	 *                         items:
	 *                           type: string
	 *                           format: uuid
	 *                           description: The Id of the comment image
	 *                           example: ef0855b6-4cc7-4be1-b2d6-c032dce7806a
	 *                 deleted:
	 *                   type: boolean
	 *                   example: true
	 *                   description: Whether or not the comment is deleted
	 *                 author:
	 *                   type: string
	 *                   example: username1
	 *                   description: The username of the comment's author
   	 *                 originalAuthor:
	 *                   type: string
	 *                   example: John
	 *                   description: (Imported comments only) returns the original author of the imported comment
	 *                 createdAt:
	 *                   type: number
	 *                   example: 1632821119000
	 *                   description: Timestamp of when the comment was created
	 *                 updatedAt:
	 *                   type: number
	 *                   example: 1632821119000
	 *                   description: Timestamp of when the comment was last updated
   	 *                 importedAt:
	 *                   type: number
	 *                   example: 1632821119000
	 *                   description: (Imported comments only) returns the time when the comment was imported
	 */
	router.get('/:comment', hasReadAccess, checkTicketExists, getComment(isFed), serialiseComment);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/{type}/{model}/tickets/{ticket}/comments:
	 *   get:
	 *     description: Get the comments of a ticket
	 *     tags: [v:external, Tickets]
	 *     operationId: getComments
	 *     parameters:
	 *       - name: teamspace
	 *         description: Name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: project
	 *         description: Project ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: type
	 *         description: Model type
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           enum: [containers, federations]
	 *       - name: model
	 *         description: Container/Federation ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: ticket
	 *         description: Ticket ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: updatedSince
	 *         description: only return comments that have been updated since a certain time (in epoch timestamp)
	 *         in: query
	 *         required: false
	 *         schema:
	 *           type: number
	 *       - name: sortBy
	 *         description: specify what property the comments should be sorted by (default is created at)
	 *         in: query
	 *         required: false
	 *         schema:
	 *           type: string
	 *       - name: sortDesc
	 *         description: specify whether the comments should be sorted in descending order (default is true)
	 *         in: query
	 *         required: false
	 *         schema:
	 *           type: boolean
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/teamspaceNotFound"
	 *       200:
	 *         description: comments have been successfully retrieved
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: array
	 *               items:
	 *                 type: object
	 *                 properties:
	 *                   _id:
	 *                     type: string
	 *                     format: uuid
	 *                     description: The ID of the comment
	 *                     example: ef0855b6-4cc7-4be1-b2d6-c032dce7806a
	 *                   message:
	 *                     type: string
	 *                     example: Example message
	 *                     description: Content of the comment
	 *                   images:
	 *                     type: array
	 *                     description: The images of the comment
	 *                     items:
	 *                       type: string
	 *                       format: uuid
	 *                       description: The Id of the comment image
	 *                       example: ef0855b6-4cc7-4be1-b2d6-c032dce7806a
	 *                   view:
	 *                     $ref: "#components/schemas/ticketCommentView"
	 *                   deleted:
	 *                     type: boolean
	 *                     example: true
	 *                     description: Whether or not the comment is deleted
	 *                   author:
	 *                     type: string
	 *                     example: username1
	 *                     description: The username of the comment's author
   	 *                   originalAuthor:
	 *                     type: string
	 *                     example: John
	 *                     description: (Imported comments only) returns the original author of the imported comment
	 *                   createdAt:
	 *                     type: number
	 *                     example: 1632821119000
	 *                     description: Timestamp of when the comment was created
	 *                   updatedAt:
	 *                     type: number
	 *                     example: 1632821119000
	 *                     description: Timestamp of when the comment was last updated
   	 *                   importedAt:
	 *                     type: number
	 *                     example: 1632821119000
	 *                     description: (Imported comments only) returns the time when the comment was imported
	 */
	router.get('', hasReadAccess, checkTicketExists, validateListSortAndFilter, getAllComments(isFed), serialiseCommentList);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/{type}/{model}/tickets/{ticket}/comments:
	 *   post:
	 *     description: Create a ticket comment
	 *     tags: [v:external, Tickets]
	 *     operationId: createComment
	 *     parameters:
	 *       - name: teamspace
	 *         description: Name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: project
	 *         description: Project ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: type
	 *         description: Model type
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           enum: [containers, federations]
	 *       - name: model
	 *         description: Container/Federation ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: ticket
	 *         description: Ticket ID
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
	 *               message:
	 *                 type: string
	 *                 description: Content of the comment
	 *                 example: Example message
	 *               images:
	 *                 description: Images of the comment
	 *                 type: array
	 *                 items:
	 *                   type: string
	 *                   description: Image in a Base64 format
	 *               view:
	 *                 $ref: "#components/schemas/ticketCommentView"
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/teamspaceNotFound"
	 *       200:
	 *         description: comment has been successfully created
	 */
	router.post('', hasCommenterAccess, checkTicketExists, validateNewComment, createComment(isFed));

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/{type}/{model}/tickets/{ticket}/comments/{comment}:
	 *   put:
	 *     description: Update a ticket comment. The current images or comment are inserted into the history array of the comment
	 *     tags: [v:external, Tickets]
	 *     operationId: updateComment
	 *     parameters:
	 *       - name: teamspace
	 *         description: Name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: project
	 *         description: Project ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: type
	 *         description: Model type
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           enum: [containers, federations]
	 *       - name: model
	 *         description: Container/Federation ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: ticket
	 *         description: Ticket ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: comment
	 *         description: Comment ID
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
	 *                 message:
	 *                   type: string
	 *                   description: Content of the comment
	 *                   example: Example message
	 *                 images:
	 *                   description: Images of the comment
	 *                   type: array
	 *                   items:
	 *                     type: string
	 *                     description: Image in a Base64 format or an ID of an image currently used in the comment
	 *                 view:
	 *                   $ref: "#components/schemas/ticketCommentView"
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/teamspaceNotFound"
	 *       200:
	 *         description: comment has been successfully updated
	 */
	router.put('/:comment', hasCommenterAccess, checkTicketExists, validateUpdateComment, updateComment(isFed));

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/{type}/{model}/tickets/{ticket}/comments/{comment}:
	 *   delete:
	 *     description: Delete a ticket comment
	 *     tags: [v:external, Tickets]
	 *     operationId: deleteComment
	 *     parameters:
	 *       - name: teamspace
	 *         description: Name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: project
	 *         description: Project ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: type
	 *         description: Model type
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           enum: [containers, federations]
	 *       - name: model
	 *         description: Container/Federation ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: ticket
	 *         description: Ticket ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: comment
	 *         description: Comment ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/teamspaceNotFound"
	 *       200:
	 *         description: comment has been successfully deleted
	 */
	router.delete('/:comment', hasCommenterAccess, canUpdateComment, deleteComment(isFed));

	return router;
};

module.exports = establishRoutes;
