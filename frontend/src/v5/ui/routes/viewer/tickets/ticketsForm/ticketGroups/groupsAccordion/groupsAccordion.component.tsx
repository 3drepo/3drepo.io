/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { useEffect, useState } from 'react';
import GroupsIcon from '@mui/icons-material/GroupWork';
import { FormattedMessage } from 'react-intl';
import { EmptyListMessage } from '@controls/dashedContainer/emptyListMessage/emptyListMessage.styles';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { GroupOverride } from '@/v5/store/tickets/tickets.types';
import { Accordion, NumberContainer, TitleContainer, Checkbox } from './groupsAccordion.styles';
import { Groups } from '../groups/groups.component';
import { TicketGroupsContext } from '../ticketGroupsContext';
import { AddGroupButton } from '../groups/groupActionMenu/addGroupButton/addGroupButton.component';

type GroupsAccordionProps = {
	title: any;
	overrides: GroupOverride[];
	colored?: boolean;
	onChange?: (value) => void;
};

const addIndex = ((overrides: GroupOverride[]) => overrides.map((h, index) => ({ index, ...h })));

export const GroupsAccordion = ({ title, overrides: groups = [], colored, onChange }: GroupsAccordionProps) => {
	const [checked, setChecked] = useState(false);
	const [indexedGroups, setIndexedGroups] = useState(addIndex(groups));
	const isAdmin = ProjectsHooksSelectors.selectIsProjectAdmin();

	const groupsCount = groups.length;

	const toggleCheckbox = (e) => {
		e.stopPropagation();
		setChecked(!checked);
	};

	const onGroupChange = (index, value) => {
		const newGroupsValue = [...groups];

		if (value) {
			newGroupsValue[index] = value;
		} else {
			newGroupsValue.splice(index, 1);
		}
		onChange?.(newGroupsValue);
	};

	useEffect(() => setIndexedGroups(addIndex(groups)), [groups]);

	return (
		<TicketGroupsContext.Provider value={{ groupType: colored ? 'colored' : 'hidden', onGroupChange }}>
			<Accordion
				Icon={GroupsIcon}
				title={(
					<TitleContainer>
						{title}
						<NumberContainer>{groupsCount}</NumberContainer>
						<Checkbox checked={checked} onClick={toggleCheckbox} />
					</TitleContainer>
				)}
				$groupsCount={groupsCount}
			>
				{groupsCount ? (
					<Groups groups={indexedGroups} />
				) : (
					<EmptyListMessage>
						<FormattedMessage
							id="ticketCard.groupsList.empty"
							defaultMessage="No Groups"
						/>
					</EmptyListMessage>
				)}
				{ isAdmin && <AddGroupButton /> }
			</Accordion>
		</TicketGroupsContext.Provider>
	);
};
