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

import { FilterForm } from '@components/viewer/cards/cardFilters/filterForm/filterForm.component';
import { CardFilterActionMenu } from '@components/viewer/cards/cardFilters/filterForm/filterForm.styles';
import { useTicketFiltersContext } from '@components/viewer/cards/cardFilters/ticketsFilters.context';
import { ActionMenuContext } from '@controls/actionMenu/actionMenuContext';
import FunnelIcon from '@assets/icons/filters/funnel.svg';
import { TicketFilter } from '@components/viewer/cards/cardFilters/cardFilters.types';

type FiltersSectionProps = {
	propertyName: string;
};

const findFilterByPropertyName = (filters: TicketFilter[], propertyName: string) => {
	const chunks = propertyName.split('.');

	// if the propertyname is like title
	if (chunks.length === 1) {
		return filters.find((f) => (f.property === chunks[0] || f.type === chunks[0]) && !f.module);
	}

	if (chunks.length === 2) {
		return filters.find((f) => f.property === chunks[1] && !f.module);
	}

	return filters.find((f) => f.property === chunks[2] && f.module === chunks[0]);
};

export const TicketsTableHeaderFilter = ({ propertyName }: FiltersSectionProps) => {
	const { setFilter, filters, choosablefilters } = useTicketFiltersContext();
	const filter =  findFilterByPropertyName([...filters, ...choosablefilters], propertyName);

	if (!filter) {
		return null;
	}

	return (
		<CardFilterActionMenu
			TriggerButton={(<FunnelIcon />)}
		>
			<ActionMenuContext.Consumer>
				{({ close }) => (
					<FilterForm
						{...filter as any}
						onCancel={close}
						onSubmit={setFilter}
					/>
				)}
			</ActionMenuContext.Consumer>
		</CardFilterActionMenu>
	);
};
