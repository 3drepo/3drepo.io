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
import { TeamspacesHooksSelectors, UsersHooksSelectors } from '@/v5/services/selectorsHooks';
import { memo } from 'react';
import { getFullnameFromUser } from '@/v5/store/users/users.helpers';
import { AssigneeCircle } from '@controls/assigneesSelect/assigneeCircle/assigneeCircle.component';
import { ItemContainer, Author, TimestampContainer, ActionType, ImportChip, UpdateChip } from '../ticketHistoryDialog.styles';
import { FormattedMessage } from 'react-intl';
import type { ITemplate, ITicketHistory } from '@/v5/store/tickets/tickets.types';
import { TextOverflow } from '@controls/textOverflow/textOverflow.component';
import { formatDateTime } from '@/v5/helpers/intl.helper';
import { getPathsOfChanges } from '../ticketHistory.helpers';
import { getPropertyLabel } from '@/v5/ui/routes/dashboard/projects/tickets/tabularView/ticketsTable.helper';
import { ChangePropertyColumn, ChangeDetailsColumn, ChangeDetailRow, ChangePropertyRow } from './ticketHistoryItem.styles';
import { ChangeDetail } from './changeDetail/changeDetail.component';
import { get } from 'lodash';

export const TicketHistoryItem = memo(({ author, timestamp, changes, imported, template }: ITicketHistory & { template: ITemplate }) => {
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const user = UsersHooksSelectors.selectUser(teamspace, author);
	const fullname = getFullnameFromUser(user);
	if (imported)  return (
		<ItemContainer>
			<TimestampContainer>{formatDateTime(timestamp)}</TimestampContainer>
			<Author />
			<ActionType>
				<ImportChip>
					<FormattedMessage id="ticketHistoryDialog.listItem.import" defaultMessage="Import" />
				</ImportChip>
			</ActionType>
		</ItemContainer>
	);

	const paths = getPathsOfChanges(changes);
	return (
		<ItemContainer>
			<TimestampContainer>{formatDateTime(timestamp)}</TimestampContainer>
			<Author>
				<AssigneeCircle assignee={author} />
				<TextOverflow>{fullname}</TextOverflow>
			</Author>
			<ActionType>
				<UpdateChip>
					<FormattedMessage id="ticketHistoryDialog.listItem.update" defaultMessage="Update" />
				</UpdateChip>
			</ActionType>
			<ChangePropertyColumn>
				{paths.map((propertyName) => (
					<ChangePropertyRow>{getPropertyLabel(propertyName)}</ChangePropertyRow>
				))}
			</ChangePropertyColumn>
			<ChangeDetailsColumn>
				{paths.map((propertyName) => (
					<ChangeDetailRow>
						<ChangeDetail template={template} propertyName={propertyName} change={get(changes, propertyName)} />
					</ChangeDetailRow>
				))}
			</ChangeDetailsColumn>
		</ItemContainer>
	);
});
TicketHistoryItem.displayName = 'TicketHistoryItem';
