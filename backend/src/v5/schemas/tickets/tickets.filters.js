const Yup = require('yup');
const { createResponseCode, templates } = require('../../utils/responseCodes');
const { types } = require('../../utils/helper/yup');

const Filters = {};

Filters.queryOperators = {
	EXISTS: 'ex',
	NOT_EXISTS: 'nex',
	EQUALS: 'eq',
	NOT_EQUALS: 'neq',
	CONTAINS: 'ss',
	NOT_CONTAINS: 'nss',
	RANGE: 'rng',
	NOT_IN_RANGE: 'nrng',
	GREATER_OR_EQUAL_TO: 'gte',
	LESSER_OR_EQUAL_TO: 'lte',
};

Filters.specialQueryFields = {
	TITLE: 'title',
	TICKET_CODE: 'ticketCode',
	TEMPLATE: 'template',
};

Filters.specialQueryFieldsOperators = [
	Filters.queryOperators.EQUALS,
	Filters.queryOperators.NOT_EQUALS,
	Filters.queryOperators.CONTAINS,
	Filters.queryOperators.NOT_CONTAINS,
];

Filters.querySchema = Yup.string()
	.matches(/^'.+'$/, 'Query must start and end with a single quote and cannot be empty');

Filters.queryParamSchema = Yup.object().shape({
	propertyName: types.strings.title
		.transform((value) => {
			if (!value?.length) return value;

			const propertyNameParts = value.split(':');
			if (propertyNameParts.length === 1) {
				const propName = propertyNameParts[0];
				return propName.startsWith('$') ? propName.substring(1) : `properties.${propName}`;
			} if (propertyNameParts.length === 2) {
				return `modules.${propertyNameParts[0]}.${propertyNameParts[1]}`;
			}

			throw createResponseCode(templates.invalidArguments, 'Property name cannot have more than one colon');
		}).required(),
	operator: Yup.string().required()
		.when('propertyName', (propertyName, schema) => {
			const validOperators = Object.values(Filters.specialQueryFields).includes(propertyName)
				? Filters.specialQueryFieldsOperators
				: Object.values(Filters.queryOperators);

			return schema.oneOf(validOperators);
		}),
	value: Yup.mixed()
		.when('operator', (operator, schema) => {
			if (operator === Filters.queryOperators.EXISTS || operator === Filters.queryOperators.NOT_EXISTS) {
				return schema.strip();
			}

			if (operator === Filters.queryOperators.RANGE || operator === Filters.queryOperators.NOT_IN_RANGE) {
				return Yup.array().of(types.range.required())
					.transform((v, value) => (value ? value.split(/,(?=\[)/) : value));
			}

			if (operator === Filters.queryOperators.GREATER_OR_EQUAL_TO
					|| operator === Filters.queryOperators.LESSER_OR_EQUAL_TO) {
				return Yup.number().required();
			}

			return Yup.array().of(types.strings.title).required()
				.transform((v, value) => (value ? value.match(/([^",]+|"(.*?)")/g)
					.map((val) => val.replace(/^"|"$/g, '').trim()) : value));
		}),
});

module.exports = Filters;
