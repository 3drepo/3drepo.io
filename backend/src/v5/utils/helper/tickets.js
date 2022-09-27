const { UUIDToString } = require("./uuids");
const Yup = require('yup');
const { propTypes } = require('../../schemas/tickets/templates.constants');


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

Tickets.serialiseTicket = (ticket, fullTemplate, stripDeprecated) => {
	const caster = generateCastObject(fullTemplate, stripDeprecated);
	return caster.cast(ticket);
};

module.exports = Tickets;