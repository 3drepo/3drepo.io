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

import { TicketsCardHooksSelectors, UsersHooksSelectors } from '@/v5/services/selectorsHooks';
import { getFullnameFromUser } from '@/v5/store/users/users.helpers';
import { AssigneeCircle } from '@controls/assigneesSelect/assigneeCircle/assigneeCircle.component';
import { ChangeValue, ItemContainer } from '../ticketHistoryDialog.styles';
import { FixedOrGrowContainer } from '@controls/fixedOrGrowContainer';
import { Row } from '@/v5/ui/routes/dashboard/projects/tickets/tabularView/tabularViewTables/ticketsTable/ticketsTableRow/ticketsTableRow.styles';
import { difference, get, has } from 'lodash';
import { findPropertyDefinition } from '@/v5/store/tickets/tickets.helpers';
import { isDateType, isSelectType } from '@components/viewer/cards/cardFilters/cardFilters.helpers';

const getChangedPaths = (changes: any, prefix = ''): string[] =>
	Object.entries(changes).flatMap(([key, value]) => {
		const path = prefix ? `${prefix}.${key}` : key;

		if (typeof value !== 'object' || value === null) return [];

		if (has(value, 'from') && has(value, 'to')) {
			return [path];
		}

		return getChangedPaths(value, path);
	});

const Detail = ({ propertyName, change }) => {
	const template = TicketsCardHooksSelectors.selectSelectedTemplate();
	const propertyDef = findPropertyDefinition(template, propertyName);
	console.log('@@- propertyDef', propertyDef);

	const { from, to } = change;
	if (propertyDef.type === 'jobsAndUsers') {
	}
	if (isDateType(propertyDef.type)) {
	}
	if (propertyDef.type === 'coords') {
	}
	if (propertyDef.type === 'view') {
	}
	if (['imageList', 'image'].includes(propertyDef.type)) {
	}
	if (isSelectType(propertyDef.type)) {
		if (propertyDef.values === 'jobsAndUsers') {
		}
		const removed = difference(from, to);
		const added = difference(to, from);
		return (
			<FixedOrGrowContainer>
				{removed.length > 0 && <span>Removed <ChangeValue>{removed.join(', ')}</ChangeValue></span>}
				{added.length > 0 && <span>Added <ChangeValue>{added.join(', ')}</ChangeValue></span>}
			</FixedOrGrowContainer>
		);
	}

	const emptyValue = [from, to].findIndex((value) => !value?.length);
	switch (emptyValue) {
		case 0: // value changed from empty
			return <FixedOrGrowContainer>Set to <ChangeValue>{to}</ChangeValue></FixedOrGrowContainer>;
		case 1: // value deleted
			return <FixedOrGrowContainer>Deleted <ChangeValue>{from}</ChangeValue></FixedOrGrowContainer>;
		default: // value changed
			return <FixedOrGrowContainer>Changed from <ChangeValue>{from}</ChangeValue> to <ChangeValue>{to}</ChangeValue></FixedOrGrowContainer>;
	}
};

const ChangesTable = ({ changes }) => {
	const paths = getChangedPaths(changes);
	console.log('@@ paths', paths);
	return (
		paths.map((propertyName) => (
			<Row key={propertyName}>
				<FixedOrGrowContainer>{propertyName}</FixedOrGrowContainer>
				<Detail propertyName={propertyName} change={get(changes, propertyName)} />
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
