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

import { CardFiltersByType } from '../cardFilters.types';
import { FilterChip } from '../filterChip/filterChip.component';
import { Section } from './filtersSection.styles';
import { FilterForm } from '../filterForm/filterForm.component';
import { ActionMenuContext } from '@controls/actionMenu/actionMenuContext';
import { CardFilterActionMenu } from '../filterForm/filterForm.styles';
import { useContext, useState } from 'react';
import { TicketFiltersContext } from '../../tickets/ticketFiltersContext';

type FiltersSectionProps = {
	module?: string;
	filters: Record<string, CardFiltersByType>;
};
export const FiltersSection = ({ module, filters }: FiltersSectionProps) => {
	const [selectedProperty, setSelectedProperty] = useState('');
	const { deleteFilter, upsertFilter } = useContext(TicketFiltersContext);

	const onDeleteFilter = (property, type) => deleteFilter({ module, property, type });

	const filtersToChips = () => {
		const filterChips = [];
		Object.entries(filters).forEach(([property, typeAndFilter]) => {
			const moduleFilterChips = Object.entries(typeAndFilter).map(([type, filter]) => [property, type, filter]);
			filterChips.push(...moduleFilterChips);
		});
		return filterChips;
	};

	return (
		<Section>
			{filtersToChips().map(([property, type, filter]) => (
				<CardFilterActionMenu
					key={property}
					onOpen={() => setSelectedProperty(property)}
					onClose={() => setSelectedProperty('')}
					TriggerButton={(
						<FilterChip
							property={property}
							type={type}
							filter={filter}
							selected={selectedProperty === property}
							onDelete={() => onDeleteFilter(property, type)}
						/>
					)}
				>
					<ActionMenuContext.Consumer>
						{({ close }) => (
							<FilterForm
								onCancel={close}
								onSubmit={upsertFilter}
								module={module}
								property={property}
								type={type}
								filter={filter}
							/>
						)}
					</ActionMenuContext.Consumer>
				</CardFilterActionMenu>
			))}
		</Section>
	);
};
