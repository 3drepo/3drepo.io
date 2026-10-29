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
import { UsersHooksSelectors } from '@/v5/services/selectorsHooks';
import { getFullnameFromUser } from '@/v5/store/users/users.helpers';
import { AssigneeCircle } from '@controls/assigneesSelect/assigneeCircle/assigneeCircle.component';
import { ItemContainer } from '../ticketHistoryDialog.styles';
import { FixedOrGrowContainer } from '@controls/fixedOrGrowContainer';
import { Row } from '@/v5/ui/routes/dashboard/projects/tickets/tabularView/tabularViewTables/ticketsTable/ticketsTableRow/ticketsTableRow.styles';
import { get, has } from 'lodash';

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
	console.log('@@ paths', paths);
	return (
		paths.map((propertyName) => (
			<Row key={propertyName}>
				<FixedOrGrowContainer>{propertyName}</FixedOrGrowContainer>
				<FixedOrGrowContainer>
					<ChangeDetail propertyName={propertyName} change={get(changes, propertyName)} />
				</FixedOrGrowContainer>
			</Row>
		))
	);
};



export const TicketHistoryItem = ({ author, timestamp, changes }) => {
	const formattedTimestamp = new Date(timestamp).toLocaleString();
	const user = UsersHooksSelectors.selectUser(author);
	const fullname = getFullnameFromUser(user);
	return (
		<ItemContainer>
			<FixedOrGrowContainer>{formattedTimestamp}</FixedOrGrowContainer>
			<FixedOrGrowContainer>
				<AssigneeCircle assignee={author} />
				{fullname}
			</FixedOrGrowContainer>
			<FixedOrGrowContainer>Update</FixedOrGrowContainer>
			<FixedOrGrowContainer>
				<ChangesTable changes={changes} />
			</FixedOrGrowContainer>
		</ItemContainer>
	);
};
