import { CRITERIA_TEMPLATES } from '../constants/criteria';

export const getCriteriaLabel = ({ field, operator, values = [] }) => {
	let template = CRITERIA_TEMPLATES[operator].replace(/\%field\%/, field);

	values.forEach((value) => {
		template = template.replace(/\%0/, value);
	});

	return template;
};
