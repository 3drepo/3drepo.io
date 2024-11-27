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
import { FiltersAccordion } from './filtersAccordion/filtersAccordion.component';
import { ModuleTitle } from './cardFilters.styles';
import { FiltersSection } from './filtersSection/filtersSection.component';
import { TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { TicketsCardActionsDispatchers } from '@/v5/services/actionsDispatchers';

export const CardFilters = () => {
	const filtersByModule = TicketsCardHooksSelectors.selectFiltersByModule();
	const hasFilters = Object.keys(filtersByModule).length > 0;

	if (!hasFilters) return null;

	return (
		<FiltersAccordion onClear={TicketsCardActionsDispatchers.resetFilters}>
			{filtersByModule.map(([module, moduleFilters]) => (
				<Fragment key={module}>
					{module && (<ModuleTitle>{module}</ModuleTitle>)}
					<FiltersSection
						module={module}
						filters={moduleFilters}
					/>
				</Fragment>
			))}
		</FiltersAccordion>
	);
};
