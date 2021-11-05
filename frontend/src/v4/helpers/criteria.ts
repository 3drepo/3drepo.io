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
