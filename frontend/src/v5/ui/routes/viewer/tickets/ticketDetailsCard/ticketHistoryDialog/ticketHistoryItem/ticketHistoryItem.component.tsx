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
import { getFullnameFromUser } from '@/v5/store/users/users.helpers';
import { AssigneeCircle } from '@controls/assigneesSelect/assigneeCircle/assigneeCircle.component';
import { ItemContainer, Author, Timestamp, ActionType, ImportChip, UpdateChip } from '../ticketHistoryDialog.styles';
import { ChangesTable } from './changesTable/changesTable.component';
import { FormattedMessage } from 'react-intl';

export const TicketHistoryItem = ({ author, timestamp, changes, imported }) => {
	const formattedTimestamp = new Date(timestamp).toLocaleString();
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const user = UsersHooksSelectors.selectUser(teamspace, author);
	const fullname = getFullnameFromUser(user);
	if (imported)  return (
		<ItemContainer>
			<Timestamp>{formattedTimestamp}</Timestamp>
			<Author />
			<ActionType>
				<ImportChip>
					<FormattedMessage id="ticketHistoryDialog.listItem.import" defaultMessage="Import" />
				</ImportChip>
			</ActionType>
		</ItemContainer>
	); 

	return (
		<ItemContainer>
			<Timestamp>{formattedTimestamp}</Timestamp>
			<Author>
				<AssigneeCircle assignee={author} />
				{fullname}
			</Author>
			<ActionType>
				<UpdateChip>
					<FormattedMessage id="ticketHistoryDialog.listItem.update" defaultMessage="Update" />
				</UpdateChip>
			</ActionType>
			<ChangesTable changes={changes} />
		</ItemContainer>
	);
};
