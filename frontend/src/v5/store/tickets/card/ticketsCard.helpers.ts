/**
 *  Copyright (C) 2025 3D Repo Ltd
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

import { sortBy, sortedUniqBy } from 'lodash';
import { getFiltersFromJobsAndUsers } from '@components/viewer/cards/cardFilters/filtersSelection/tickets/ticketFilters.helpers';
import { TicketsCardHooksSelectors, TicketsHooksSelectors } from '@/v5/services/selectorsHooks';

export const getFilterPropertyOptions = (
	containersAndFederations: any[],
	module: string,
	property: string,
) => {
	const templates = TicketsCardHooksSelectors.selectCurrentTemplates();
	const riskCategories = TicketsHooksSelectors.selectRiskCategories();
	const jobsAndUsers = TicketsCardHooksSelectors.selectJobsAndUsersByModelIds(containersAndFederations);

	const allValues: { value: any; type: string }[] = [];

	if (!module && property === 'Owner') {
		return getFiltersFromJobsAndUsers(jobsAndUsers.filter((ju) => !!ju.firstName));
	}

	templates.forEach((template) => {
		const matchingModule = module
			? template.modules.find((mod) => (mod.name || mod.type) === module)?.properties
			: template.properties;

		const matchingProperty = matchingModule?.find(
			({ name, type: t }) => name === property && ['manyOf', 'oneOf'].includes(t),
		);

		if (!matchingProperty) return;

		switch (matchingProperty.values) {
			case 'riskCategories':
				allValues.push(...riskCategories.map((value: any) => ({ value, type: 'riskCategories' })));
				break;
			case 'jobsAndUsers':
				allValues.push(...getFiltersFromJobsAndUsers(jobsAndUsers));
				break;
			default:
				allValues.push(...matchingProperty.values.map((value: any) => ({ value, type: 'default' })));
		}
	});

	return sortedUniqBy(sortBy(allValues, 'value'), 'value');
};