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

import { CardFiltersByOperator, CardFilterOperator, FormFilter, CardFilter } from '../cardFilters.types';
import { FilterChip } from '../filterChip/filterChip.component';
import { Section } from './filtersSection.styles';
import { FilterForm } from '../filterForm/filterForm.component';
import { ActionMenuContext } from '@controls/actionMenu/actionMenuContext';
import { CardFilterActionMenu } from '../filterForm/filterForm.styles';
import { useContext, useState } from 'react';
import { TicketFiltersContext } from '../../tickets/ticketFiltersContext';

type FiltersSectionProps = {
	module?: string;
	filters: Record<string, CardFiltersByOperator>;
};
export const FiltersSection = ({ module, filters }: FiltersSectionProps) => {
	const [selectedChip, setSelectedChip] = useState('');
	const { deleteFilter, editFilter } = useContext(TicketFiltersContext);

	const onDeleteFilter = (property, operator) => deleteFilter({ module, property, operator });

	const handleEditFilter = (oldOperator: CardFilterOperator) => (newFilter: CardFilter) => editFilter(newFilter, oldOperator);

	const filtersToChips = () => {
		const filterChips = [];
		Object.entries(filters).forEach(([property, operatorAndFilter]) => {
			const moduleFilterChips = Object.entries(operatorAndFilter).map(([operator, filter]) => [property, operator, filter]);
			filterChips.push(...moduleFilterChips);
		});
		return filterChips;
	};

	return (
		<Section>
			{filtersToChips().map(([property, operator, filter]) => {
				const filterKey = `${property}.${operator}`;
				return (
					<CardFilterActionMenu
						key={filterKey}
						onOpen={() => setSelectedChip(filterKey)}
						onClose={() => setSelectedChip('')}
						TriggerButton={(
							<FilterChip
								{...filter}
								operator={operator}
								property={property}
								selected={selectedChip === filterKey}
								onDelete={() => onDeleteFilter(property, operator)}
							/>
						)}
					>
						<ActionMenuContext.Consumer>
							{({ close }) => (
								<FilterForm
									onCancel={close}
									onSubmit={handleEditFilter(operator)}
									module={module}
									property={property}
									operator={operator}
									{...filter}
								/>
							)}
						</ActionMenuContext.Consumer>
					</CardFilterActionMenu>
				);
			})}
		</Section>
	);
};
