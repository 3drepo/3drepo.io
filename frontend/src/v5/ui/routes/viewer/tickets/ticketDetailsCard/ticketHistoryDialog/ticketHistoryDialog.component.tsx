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

import { TicketsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { formatMessage } from '@/v5/services/intl';
import { TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { modelIsFederation } from '@/v5/store/tickets/tickets.helpers';
import { Modal } from '@components/shared/modalsDispatcher/modalsDispatcher.styles';
import { Form } from '@controls/formModal/formModal.styles';
import { ModalBody } from '@controls/formModal/modalBody/modalBody.styles';
import { ModalHeader } from '@controls/formModal/modalHeader/modalHeader.component';
import { useEffect } from 'react';

export const TicketHistoryDialog = ({ onClickClose, open, title, ticketId, teamspace, project, containerOrFederation, ...props }) => {
	const isFederation = modelIsFederation(containerOrFederation);
	const ticketHistory = TicketsHooksSelectors.selectTicketHistoryByTicketId(ticketId);

	useEffect(() => {
		TicketsActionsDispatchers.fetchTicketHistory(teamspace, project, containerOrFederation, ticketId, isFederation);
	}, [ticketId]);

	return (
		<Modal open={open} onClose={onClickClose}>
			<Form>
				<ModalHeader
					onClickClose={onClickClose}
					title={formatMessage({
						id: 'ticketHistoryDialog.title',
						defaultMessage: 'Ticket history',
					})}
					subtitle={formatMessage({
						id: 'ticketHistoryDialog.subtitle',
						defaultMessage: 'Change history for {ticketName}',
					}, { ticketName: 'placeholder' })}
				/>
				<ModalBody>
					History
				</ModalBody>
			</Form>
		</Modal>
	);
};