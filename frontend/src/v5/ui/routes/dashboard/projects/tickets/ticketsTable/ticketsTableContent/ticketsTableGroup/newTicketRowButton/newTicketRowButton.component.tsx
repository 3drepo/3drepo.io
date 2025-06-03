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

import { ResizableTableContext } from '@controls/resizableTableContext/resizableTableContext';
import { useResizableState } from '@controls/resizableTableContext/resizableTableContext.hooks';
import { ResizableEvent } from '@controls/resizableTableContext/resizableTableContext.types';
import { useContext } from 'react';
import { NewTicketRow, NewTicketText, NewTicketTextContainer } from './newTicketRowButton.styles';
import { FormattedMessage } from 'react-intl';
import AddCircleIcon from '@assets/icons/filled/add_circle-filled.svg';
import { NewTicketMenu } from '../../../newTicketMenu/newTicketMenu.component';

type NewTicketRowButtonProps = {
	disabled?: boolean;
	onNewTicket: (modelId: string) => void;
};
export const NewTicketRowButton = ({ onNewTicket, disabled }: NewTicketRowButtonProps) => {
	const { getRowWidth } = useContext(ResizableTableContext);
	const rowWidth = useResizableState([ResizableEvent.VISIBLE_COLUMNS_CHANGE, ResizableEvent.WIDTH_CHANGE], getRowWidth);

	return (
		<NewTicketMenu
			disabled={disabled}
			TriggerButton={(
				<NewTicketRow
					disabled={disabled}
					style={{ width: rowWidth }}
				>
					<NewTicketTextContainer>
						<AddCircleIcon />
						<NewTicketText>
							<FormattedMessage id="ticketTable.row.newTicket" defaultMessage="New ticket" />
						</NewTicketText>
					</NewTicketTextContainer>
				</NewTicketRow>
			)}
			useMousePosition
			onContainerOrFederationClick={onNewTicket}
		/>
	);
};