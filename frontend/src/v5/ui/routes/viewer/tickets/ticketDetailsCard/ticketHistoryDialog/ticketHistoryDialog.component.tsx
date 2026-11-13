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
import { ProjectsHooksSelectors, TeamspacesHooksSelectors, TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { modelIsFederation } from '@/v5/store/tickets/tickets.helpers';
import { Modal } from '@components/shared/modalsDispatcher/modalsDispatcher.styles';
import { Form } from '@controls/formModal/formModal.styles';
import { ModalHeader } from '@controls/formModal/modalHeader/modalHeader.component';
import { useEffect } from 'react';
import { TicketHistoryItem } from './ticketHistoryItem/ticketHistoryItem.component';
import { DashboardListHeader as Header, DashboardListHeaderLabel as Label } from '@components/dashboard/dashboardList';
import { FormattedMessage } from 'react-intl';
import { ColumnWidths } from './ticketHistory.helpers';
import { TicketHistoryTable, ModalBody, NoHistoryMessage } from './ticketHistoryDialog.styles';

type ITicketHistoryDialog = {
	onClickClose: () => void;
	open: boolean;
	containerOrFederation: string;
	ticketId: string;
};

export const TicketHistoryDialog = ({ onClickClose, open, containerOrFederation, ticketId }: ITicketHistoryDialog) => {
	const ticket = TicketsHooksSelectors.selectTicketById(containerOrFederation, ticketId);
	const templateTabularView = ProjectsHooksSelectors.selectCurrentProjectTemplateById(ticket?.type);
	const templateViewer = TicketsHooksSelectors.selectTemplateById(containerOrFederation, ticket?.type);
	const template = templateTabularView ?? templateViewer;
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const project = ProjectsHooksSelectors.selectCurrentProject();
	const isFederation = modelIsFederation(containerOrFederation);
	const ticketHistory = TicketsHooksSelectors.selectTicketHistoryByTicketId(ticket?._id);
	
	useEffect(() => {
		TicketsActionsDispatchers.fetchTicketHistory(teamspace, project, containerOrFederation, ticket?._id, isFederation);
	}, [ticket?._id]);

	return (
		<Modal open={open} onClose={onClickClose} maxWidth="xl" fullWidth>
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
					}, { ticketName: ticket?.title ?? '' })}
				/>
				<ModalBody>
					<Header onSortingChange={() => {}}>
						<Label width={ColumnWidths.Timestamp}>
							<FormattedMessage id="ticketHistoryDialog.list.header.date" defaultMessage="Date" />
						</Label>
						<Label width={ColumnWidths.Author}>
							<FormattedMessage id="ticketHistoryDialog.list.header.user" defaultMessage="User" />
						</Label>
						<Label width={ColumnWidths.ActionType}>
							<FormattedMessage id="ticketHistoryDialog.list.header.action" defaultMessage="Action" />
						</Label>
						<Label width={ColumnWidths.ChangePropertyName}>
							<FormattedMessage id="ticketHistoryDialog.list.header.property" defaultMessage="Property" />
						</Label>
						<Label minWidth={ColumnWidths.ChangeDetails}>
							<FormattedMessage id="ticketHistoryDialog.list.header.details" defaultMessage="Details" />
						</Label>
					</Header>
					<TicketHistoryTable>
						{ticketHistory.length < 1 && (
							<NoHistoryMessage>
								<FormattedMessage id="ticketHistoryDialog.list.noHistory" defaultMessage="No history available" />
							</NoHistoryMessage>
						)}
						{ticketHistory?.toReversed().map((historyItem) => (
							<TicketHistoryItem key={historyItem.timestamp} template={template} {...historyItem} />
						))}
					</TicketHistoryTable>
				</ModalBody>
			</Form>
		</Modal>
	);
};
