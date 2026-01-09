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

import { CardFilterActionMenu } from '@components/viewer/cards/cardFilters/filterForm/filterForm.styles';
import { ActionMenuContext } from '@controls/actionMenu/actionMenuContext';
import ArrowDownIcon from '@assets/icons/filled/caret-filled.svg';
import { useState } from 'react';
import { BulkEditHeaderButton, HeaderCell, HeaderCellText } from '../ticketsTableHeaders.styles';
import { getPropertyLabel } from '../../../../ticketsTable.helper';
import { TICKET_HEADER_POPOVER_PROPS } from '../ticketsTableHeaders.helpers';
import { TicketsTableHeaderBulkEditForm } from './ticketsTableHeaderBulkEditForm.component';

type TicketsTableHeaderBulkEditProps = {
	name: string;
}

export const TicketsTableHeaderBulkEdit = ({ name, ...props }: TicketsTableHeaderBulkEditProps) => {
	const [active, setActive] = useState(false);
	return (
		<CardFilterActionMenu
			onClose={() => setActive(false)}
			onOpen={() => setActive(true)}
			TriggerButton={(
				<HeaderCell name={name} {...props}>
					<BulkEditHeaderButton>
						<HeaderCellText>
							{getPropertyLabel(name)}
				 		</HeaderCellText>
						<ArrowDownIcon />
				 	</BulkEditHeaderButton>
				</HeaderCell>
			)}
			PopoverProps={TICKET_HEADER_POPOVER_PROPS}
		>
			<ActionMenuContext.Consumer>
				{({ close }) => (
					<TicketsTableHeaderBulkEditForm name={name} onCancel={close} />
				)}
			</ActionMenuContext.Consumer>
		</CardFilterActionMenu>
	);
};
