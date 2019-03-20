import { uniqueId } from 'lodash';
import { CRITERIA_TEMPLATES } from '../constants/criteria';

export const getCriteriaLabel = ({ field, operator, values = [] }) => {
	const template = CRITERIA_TEMPLATES[operator].replace(/\%field/, field);

	if (template.includes(`%values`)) {
		const valuesString = values.join(', ');
		return template.replace(/\%values/, valuesString);
	}

	return values.reduce((label, value) => label.replace(/\%0/, value), template);
};

export const getCriterionId = () => uniqueId('criterion-');

export const prepareCriterion = (criterion) => ({
	...criterion,
	_id: getCriterionId()
});

export const getUpdatedCriteria = (selectedCriteria, newCriterion) => {
	const isNewCriterion = !newCriterion._id;

	if (!isNewCriterion) {
		return selectedCriteria.map((criterion) => {
			if (criterion._id === newCriterion._id) {
				return newCriterion;
			}
			return criterion;
		});
	}

	const preparedCriterion = prepareCriterion(newCriterion);
	return [...selectedCriteria, preparedCriterion];
};
