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
import { ChangeDetail } from './changeDetail.component';
import { TeamspacesHooksSelectors, UsersHooksSelectors } from '@/v5/services/selectorsHooks';
import { getFullnameFromUser } from '@/v5/store/users/users.helpers';
import { AssigneeCircle } from '@controls/assigneesSelect/assigneeCircle/assigneeCircle.component';
import { ItemContainer, ChangeRow, ChangePropertyName, DetailContainer, Author, Timestamp, ActionType } from '../ticketHistoryDialog.styles';
import { get, has } from 'lodash';
import { getPropertyLabel } from '@/v5/ui/routes/dashboard/projects/tickets/tabularView/ticketsTable.helper';

const getChangedPaths = (changes: any, prefix = ''): string[] =>
	Object.entries(changes).flatMap(([key, value]) => {
		const path = prefix ? `${prefix}.${key}` : key;

		if (typeof value !== 'object' || value === null) return [];

		if (has(value, 'from') && has(value, 'to')) {
			return [path];
		}

		return getChangedPaths(value, path);
	});

const ChangesTable = ({ changes }) => {
	const paths = getChangedPaths(changes);
	return (
		<div>
			{paths.map((propertyName) => (
				<ChangeRow key={propertyName}>
					<ChangePropertyName>{getPropertyLabel(propertyName)}</ChangePropertyName>
					<DetailContainer>
						<ChangeDetail propertyName={propertyName} change={get(changes, propertyName)} />
					</DetailContainer>
				</ChangeRow>
			))}
		</div>
	);
};



export const TicketHistoryItem = ({ author, timestamp, changes }) => {
	const formattedTimestamp = new Date(timestamp).toLocaleString();
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const user = UsersHooksSelectors.selectUser(teamspace, author);
	const fullname = getFullnameFromUser(user);
	return (
		<ItemContainer>
			<Timestamp>{formattedTimestamp}</Timestamp>
			<Author>
				<AssigneeCircle assignee={author} />
				{fullname}
			</Author>
			<ActionType>Update</ActionType>
			<ChangesTable changes={changes} />
		</ItemContainer>
	);
};
