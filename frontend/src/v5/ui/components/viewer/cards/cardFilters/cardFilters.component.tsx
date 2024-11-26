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

import { Fragment, useContext } from 'react';
import { FiltersAccordion } from './filtersAccordion/filtersAccordion.component';
import { ModuleTitle } from './cardFilters.styles';
import { FiltersSection } from './filtersSection/filtersSection.component';
import { CardFiltersCreatorForm } from './cardFiltersCreatorForm/cardFiltersCreatorForm.temp';
import { TicketFiltersContext } from '../tickets/ticketFiltersContext';
import { TicketBaseKeys } from '@/v5/ui/routes/viewer/tickets/tickets.constants';

export const CardFilters = () => {
	const { filters, deleteAllFilters } = useContext(TicketFiltersContext);
	const hasFilters = Object.keys(filters).length > 0;

	return (
		<>
			<CardFiltersCreatorForm />
			{hasFilters && (
				<FiltersAccordion onClear={deleteAllFilters}>
					{Object.entries(filters).sort((a, b) => a[0].localeCompare(b[0])).map(([module, moduleFilters]) => (
						<Fragment key={module}>
							{module && (module !== TicketBaseKeys.PROPERTIES) && (<ModuleTitle>{module}</ModuleTitle>)}
							<FiltersSection
								module={module}
								filters={moduleFilters}
							/>
						</Fragment>
					))}
				</FiltersAccordion>
			)}
		</>
	);
};
