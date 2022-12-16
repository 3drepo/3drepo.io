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

const { codeExists, createResponseCode, templates } = require('../../../../../../../utils/responseCodes');
const { processReadOnlyValues, validateTicket: validateTicketSchema } = require('../../../../../../../schemas/tickets');
const { checkTicketTemplateExists } = require('../../../settings');
const { getTemplateById } = require('../../../../../../../models/tickets.templates');
const { getTicketById } = require('../../../../../../../models/tickets');
const { getUserFromSession } = require('../../../../../../../utils/sessions');
const { isEqual } = require('../../../../../../../utils/helper/objects');
const { respond } = require('../../../../../../../utils/responder');
const { stringToUUID } = require('../../../../../../../utils/helper/uuids');
const { validateMany } = require('../../../../../../common');
const { getCommentByQuery } = require('../../../../../../../models/tickets.comments');

const TicketsMiddleware = {};

const validateTicket = (isNewTicket) => async (req, res, next) => {
	try {
		const oldTicket = req.ticketData;
		const newTicket = req.body;
		const template = req.templateData;
		const user = getUserFromSession(req.session);
		const { teamspace } = req.params;

		if (isNewTicket && template.deprecated) {
			throw createResponseCode(templates.invalidArguments, 'Template has been deprecated');
		}

		req.body = await validateTicketSchema(teamspace, template, newTicket, oldTicket);

		if (!isNewTicket && isEqual(req.body, { modules: {}, properties: {} })) {
			throw createResponseCode(templates.invalidArguments, 'No valid properties to update.');
		}

		processReadOnlyValues(req.ticketData, req.body, user);
		await next();
	} catch (err) {
		const response = codeExists(err.code) ? err : createResponseCode(templates.invalidArguments, err.message);
		respond(req, res, response);
	}
};

const validateComment = (isNewComment) => async (req, res, next) => {
	try {
		if (req.templateData.deprecated) {
			throw createResponseCode(templates.invalidArguments, 'Template has been deprecated');
		}

		const schema = Yup.object().shape({
			comment: Yup.string(),
			images: Yup.array().of(isNewComment ?
				types.embeddedImage(true) :
				Yup.array().of(Yup.mixed().test('test-name', 'error-msg', async (value) => {
					if (isUUIDString(value)) {
						const { images } = await getCommentByQuery(req.params.teamspace, 
							{ _id: req.params.comment }, { images: 1 }) ?? [];

						return images.includes(value);
					}

					try {
						Buffer.from(value, 'base64')
						return true;
					} catch {
						return false;
					}					
				}))
			),
		}).strict(true).noUnknown().test(
			'at-least-one-property',
			'You must provide either a comment or a set of images',
			(value) => Object.keys(value).length,
		).required();

		await schema.validate(commentData);

		await next();
	} catch (err) {
		const response = codeExists(err.code) ? err : createResponseCode(templates.invalidArguments, err.message);
		respond(req, res, response);
	}
};

const templateIDToParams = async (req, res, next) => {
	if (req.body?.type) {
		req.body.type = stringToUUID(req.body.type);
		req.params.template = req.body.type;
		await next();
	} else {
		respond(req, res, createResponseCode(templates.invalidArguments, 'Template must be provided'));
	}
};

const checkTicketExists = async (req, res, next) => {
	const { teamspace, project, ticket } = req.params;
	const model = req.params.container ?? req.params.federation;

	try {
		req.ticketData = await getTicketById(teamspace, project, model, ticket);
		req.templateData = await getTemplateById(teamspace, req.ticketData.type);

		await next();
	} catch (err) {
		respond(req, res, err);
	}
};

const checkCommentExists = async (req, res, next) => {
	const { teamspace, comment } = req.params;
	const model = req.params.container ?? req.params.federation;

	try {
		req.commentData = await getCommentByQuery(teamspace, { _id: comment, model }, { history: 1, comment, images });

		await next();
	} catch (err) {
		respond(req, res, err);
	}
};

TicketsMiddleware.validateNewTicket = validateMany([templateIDToParams, checkTicketTemplateExists, validateTicket(true)]);
TicketsMiddleware.validateUpdateTicket = validateMany([checkTicketExists, validateTicket(false)]);
TicketsMiddleware.validateNewComment = validateMany([checkTicketExists, validateComment(true)]);
TicketsMiddleware.validateUpdateComment = validateMany([checkTicketExists, checkCommentExists, validateComment()]);

TicketsMiddleware.templateExists = checkTicketTemplateExists;

module.exports = TicketsMiddleware;
