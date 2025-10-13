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

import { TicketFilter } from '../cardFilters.types';
import { FilterChip } from '../filterChip/filterChip.component';
import { Section } from './filtersSection.styles';
import { FilterForm } from '../filterForm/filterForm.component';
import { ActionMenuContext } from '@controls/actionMenu/actionMenuContext';
import { CardFilterActionMenu } from '../filterForm/filterForm.styles';
import { useState } from 'react';
import { isEqual } from 'lodash';
import { useTicketFiltersContext } from '../ticketsFilters.context';

type FiltersSectionProps = {
	filters: TicketFilter[];
};
export const FiltersSection = ({ filters }: FiltersSectionProps) => {
	const [selectedFilter, setSelectedFilter] = useState({});
	const { deleteFilter, setFilter, displayMode } = useTicketFiltersContext();

	return (
		<Section>
			{filters.map((filter) => (
				<CardFilterActionMenu
					$displayMode={displayMode}
					key={Object.keys(filter).join()}
					onOpen={() => setSelectedFilter(filter)}
					onClose={() => setSelectedFilter({})}
					TriggerButton={(
						<FilterChip
							{...filter as any}
							selected={isEqual(selectedFilter, filter)}
							onDelete={() => deleteFilter(filter)}
						/>
					)}
				>
					<ActionMenuContext.Consumer>
						{({ close }) => (
							<FilterForm
								{...filter as any}
								onCancel={close}
								onSubmit={setFilter}
								cancelButton
							/>
						)}
					</ActionMenuContext.Consumer>
				</CardFilterActionMenu>
			))}
		</Section>
	);
};
