/**
 *  Copyright (C) 2021 3D Repo Ltd
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

const { UUIDToString } = require('../../../../../../../utils/helper/uuids');
const Yup = require('yup');

const { generateFullSchema } = require('../../../../../../../schemas/tickets/templates');
const { getTemplateById } = require('../../../../../../../models/tickets.templates');
const { propTypes } = require('../../../../../../../schemas/tickets/templates.constants');
const { respond } = require('../../../../../../../utils/responder');
const { serialiseTicketSchema } = require('../../../../common/tickets.templates');
const { templates } = require('../../../../../../../utils/responseCodes');

const Tickets = {};

const uuidString = Yup.string().transform((val, orgVal) => UUIDToString(orgVal));

const generateCastObject = ({ properties, modules }, stripDeprecated) => {
	const castProps = (props) => {
		const res = {};
		props.forEach(({ type, name, deprecated }) => {
			if (stripDeprecated && deprecated) {
				res[name] = Yup.mixed().strip();
			} else if (type === propTypes.DATE) {
				res[name] = Yup.number().transform((_, val) => val.getTime());
			} else if (type === propTypes.VIEW) {
				res[name] = Yup.object({
					state: Yup.object({
						highlightedGroups: Yup.array().of(uuidString),
						colorOverrideGroups: Yup.array().of(uuidString),
						hiddenGroups: Yup.array().of(uuidString),
						shownGroups: Yup.array().of(uuidString),
						transformGroups: Yup.array().of(uuidString),
					}).default(undefined),
				}).default(undefined);
			}
		});

		return Yup.object(res).default(undefined);
	};

	const modulesCaster = {};

	modules.forEach(({ name, type, deprecated, properties: modProps }) => {
		const id = name ?? type;
		if (stripDeprecated && deprecated) {
			modulesCaster[id] = Yup.mixed().strip();
		} else {
			modulesCaster[id] = castProps(modProps);
		}
	});

	return Yup.object({
		_id: uuidString,
		properties: castProps(properties),
		modules: Yup.object(modulesCaster).default(undefined),
	});
};

const serialiseTicket = (ticket, template, stripDeprecated) => {
	const caster = generateCastObject(template, stripDeprecated);
	return caster.cast(ticket);
};

Tickets.serialiseFullTicketTemplate = (req, res) => {
	try {
		const { templateData, query } = req;
		const showDeprecated = query?.showDeprecated === 'true';
		const fullTemplate = generateFullSchema(templateData);

		respond(req, res, templates.ok, serialiseTicketSchema(fullTemplate, !showDeprecated));
	} catch (err) {
		respond(req, res, templates.unknown);
	}
};

Tickets.serialiseTicket = async (req, res) => {
	try {
		const { teamspace } = req.params;
		const { ticket, showDeprecated } = req;
		const template = generateFullSchema(await getTemplateById(teamspace, ticket.type));

		respond(req, res, templates.ok, serialiseTicket(ticket, template, !showDeprecated));
	} catch (err) {
		respond(req, res, templates.unknown);
	}
};

module.exports = Tickets;
