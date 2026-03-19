/**
 *  Copyright (C) 2026 3D Repo Ltd
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

import { TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { TicketsBulkUpdateContext } from '@components/tickets/bulkUpdate/bulkUpdate.context';
import { useContext, useEffect } from 'react';
import { AllTicketsCheckbox, AllTicketsCheckboxContainer } from './bulkUpdate.styles';
import { FormattedMessage } from 'react-intl';

type ToggleAllCheckboxProps = {
	$withFilters?: boolean
};

export const ToggleAllCheckbox = ({ $withFilters }: ToggleAllCheckboxProps) => {
	const { bulkModeOn, selectedItems, addOrRemoveSelection } = useContext(TicketsBulkUpdateContext);
	const filteredTickets = TicketsCardHooksSelectors.selectFilteredTickets();
	const filters = TicketsCardHooksSelectors.selectCardFilters();
	const checked = filteredTickets.length === selectedItems.size && filteredTickets.length > 0;
	// const indeterminate = !checked && Array.from(selectedItems).some((id) => filteredTickets.some((t) => t._id === id));
	const indeterminate = !checked && filteredTickets.some((t) => selectedItems.has(t._id));

	const toggleAllChecked = () => {
		addOrRemoveSelection(filteredTickets.map((t) => t._id), checked);
	};

	useEffect(() => {
		// reset selection when filters change
		addOrRemoveSelection(Array.from(selectedItems), true);
	}, [filters]);

	if (!bulkModeOn) {
		return null;
	}

	return (
		<AllTicketsCheckboxContainer variant="label" $withFilters={$withFilters}>
			<AllTicketsCheckbox checked={checked} indeterminate={indeterminate} disabled={filteredTickets.length == 0} onClick={toggleAllChecked}/>
			<FormattedMessage id="viewer.cards.ticket.selectAll" defaultMessage="Select All" />
		</AllTicketsCheckboxContainer>
	);
};