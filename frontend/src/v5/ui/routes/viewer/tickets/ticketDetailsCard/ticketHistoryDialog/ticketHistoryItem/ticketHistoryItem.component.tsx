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

import { UsersHooksSelectors } from '@/v5/services/selectorsHooks';
import { getFullnameFromUser } from '@/v5/store/users/users.helpers';
import { AssigneeCircle } from '@controls/assigneesSelect/assigneeCircle/assigneeCircle.component';
import { ChangeValue, ItemContainer } from '../ticketHistoryDialog.styles';
import { FixedOrGrowContainer } from '@controls/fixedOrGrowContainer';
import { Row } from '@/v5/ui/routes/dashboard/projects/tickets/tabularView/tabularViewTables/ticketsTable/ticketsTableRow/ticketsTableRow.styles';

const ChangesTable = ({ changes }) => {
	const { properties = {}, ...topLevelChanges } = changes;

	const rows = [
		...Object.entries(topLevelChanges),
		...Object.entries(properties),
	].map(([propertyName, change]) => ({
		propertyName,
		change,
	}));
	console.log('@@ rows', rows);
	return (
		rows.map(({ propertyName, change }) => (
			<Row key={propertyName}>
				<FixedOrGrowContainer>{propertyName}</FixedOrGrowContainer>
				<FixedOrGrowContainer>Changed from <ChangeValue>{change?.from ?? ''}</ChangeValue> to <ChangeValue>{change?.to ?? ''}</ChangeValue></FixedOrGrowContainer>
			</Row>
		))
	);
};



export const TicketHistoryItem = ({ author, timestamp, changes }) => {
	const formattedTimestamp = new Date(timestamp).toLocaleString();
	const user = UsersHooksSelectors.selectUser(author);
	const fullname = getFullnameFromUser(user);
	console.log('@@ ticketHistoryItem', { author, timestamp, changes });
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