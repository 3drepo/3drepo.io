/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { Fragment } from 'react';
import { CardFilterOperator } from '../../cardFilters/cardFilters.types';
import { FiltersAccordion } from '../../cardFilters/filtersAccordion/filtersAccordion.component';
import { FiltersSection } from '../../cardFilters/filtersSection/filtersSection.component';
import { ModuleTitle } from './ticketsFiltersList.styles';

type TicketsFiltersListProps = {
	onDeleteFilter: (module: string, property: string, operator: CardFilterOperator) => void;
	onDeleteAllFilters: () => void;
	filters: Record<string, any>;
};
export const TicketsFiltersList = ({ filters, onDeleteFilter, onDeleteAllFilters }: TicketsFiltersListProps) => {
	const onDeleteModuleFilter = (moduleName) => (property, operator) => onDeleteFilter(moduleName, property, operator);

	return (
		<FiltersAccordion onClear={onDeleteAllFilters}>
			{Object.entries(filters).sort((a, b) => a[0].localeCompare(b[0])).map(([moduleName, moduleFilters]) => (
				<Fragment key={moduleName}>
					{moduleName && (<ModuleTitle>{moduleName}</ModuleTitle>)}
					<FiltersSection filters={moduleFilters} onDeleteFilter={onDeleteModuleFilter(moduleName)} />
				</Fragment>
			))}
		</FiltersAccordion>
	);
};