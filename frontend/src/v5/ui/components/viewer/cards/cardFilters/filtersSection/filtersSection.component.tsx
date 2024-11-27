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

import { CardFilter } from '../cardFilters.types';
import { FilterChip } from '../filterChip/filterChip.component';
import { Section } from './filtersSection.styles';
import { FilterForm } from '../filterForm/filterForm.component';
import { ActionMenuContext } from '@controls/actionMenu/actionMenuContext';
import { CardFilterActionMenu } from '../filterForm/filterForm.styles';
import { useState } from 'react';
import { TicketsCardActionsDispatchers } from '@/v5/services/actionsDispatchers';

type FiltersSectionProps = {
	module?: string;
	filters: CardFilter[];
};
export const FiltersSection = ({ module, filters }: FiltersSectionProps) => {
	const [selectedProperty, setSelectedProperty] = useState('');

	const onDeleteFilter = (property, type) => TicketsCardActionsDispatchers.deleteFilter({ module, property, type });

	return (
		<Section>
			{filters.map(({ property, type, filter }) => (
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
								onSubmit={TicketsCardActionsDispatchers.upsertFilter}
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
