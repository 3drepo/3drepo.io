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

const { getTemplateById, getTemplatesByQuery } = require('../../../../../../../models/tickets.templates');
const { UUIDToString } = require('../../../../../../../utils/helper/uuids');
const Yup = require('yup');
const { generateFullSchema } = require('../../../../../../../schemas/tickets/templates');
const { propTypes } = require('../../../../../../../schemas/tickets/templates.constants');
const { respond } = require('../../../../../../../utils/responder');
const { serialiseTicketTemplate } = require('../../../../common/tickets.templates');
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
			} else if (type === propTypes.IMAGE) {
				res[name] = uuidString;
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
		type: uuidString,
		properties: castProps(properties),
		modules: Yup.object(modulesCaster).default(undefined),
	});
};

const serialiseTicket = async (teamspace, ticket, template, stripDeprecated) => {
	let templateData = template;
	if (!templateData) {
		templateData = generateFullSchema(await getTemplateById(teamspace, ticket.type));
	}
	const caster = generateCastObject(templateData, stripDeprecated);
	return caster.cast(ticket);
};

Tickets.serialiseFullTicketTemplate = (req, res) => {
	try {
		const { templateData, query } = req;
		const showDeprecated = query?.showDeprecated === 'true';
		const fullTemplate = generateFullSchema(templateData);

		respond(req, res, templates.ok, serialiseTicketTemplate(fullTemplate, !showDeprecated));
	} catch (err) {
		respond(req, res, templates.unknown);
	}
};

Tickets.serialiseTicket = async (req, res) => {
	try {
		const { teamspace } = req.params;
		const { ticket, showDeprecated } = req;

		respond(req, res, templates.ok, await serialiseTicket(teamspace, ticket, undefined, !showDeprecated));
	} catch (err) {
		respond(req, res, templates.unknown);
	}
};

const getTemplatesDictionary = async (teamspace, templateIds) => {
	const res = {};

	const data = await getTemplatesByQuery(teamspace, { _id: { $in: templateIds } });

	data.forEach((tem) => {
		res[UUIDToString(tem._id)] = generateFullSchema(tem);
	});

	return res;
};

Tickets.serialiseTicketList = async (req, res) => {
	try {
		const { teamspace } = req.params;
		const { tickets } = req;

		const idArr = tickets.map(({ type }) => type);
		const templateIds = new Set(idArr);

		const templateLUT = await getTemplatesDictionary(teamspace, Array.from(templateIds));
		const outputProms = tickets.map((ticket) => serialiseTicket(teamspace,
			ticket, templateLUT[UUIDToString(ticket.type)], true));
		respond(req, res, templates.ok, { tickets: await Promise.all(outputProms) });
	} catch (err) {
		respond(req, res, templates.unknown);
	}
};

module.exports = Tickets;
