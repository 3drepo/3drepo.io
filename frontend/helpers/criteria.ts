import { CRITERIA_TEMPLATES } from '../constants/criteria';

export const getCriteriaLabel = ({ field, operator, values = [] }) => {
	const template = CRITERIA_TEMPLATES[operator].replace(/\%field/, field);

	if (template.includes(`%values`)) {
		const valuesString = values.join(', ');
		return template.replace(/\%values/, valuesString);
	}

	return values.reduce((label, value) => label.replace(/\%0/, value), template);
};
