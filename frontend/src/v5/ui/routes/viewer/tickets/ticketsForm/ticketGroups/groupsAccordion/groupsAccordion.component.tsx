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

import { useState } from 'react';
import GroupsIcon from '@mui/icons-material/GroupWork';
import { GroupOverride } from '@/v5/store/tickets/tickets.types';
import { FormattedMessage } from 'react-intl';
import { EmptyListMessage } from '@controls/dashedContainer/emptyListMessage/emptyListMessage.styles';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { AccordionProps } from '@controls/accordion/accordion.component';
import { Accordion, NumberContainer, TitleContainer, Checkbox } from './groupsAccordion.styles';
import { Groups } from '../groups/groups.component';
import { AddGroupButton } from '../groups/groupActionMenu/addGroupButton/addGroupButton.component';

type GroupsAccordionProps = Omit<AccordionProps, 'Icon'> & {
	title: any;
	groups: GroupOverride[];
};
export const GroupsAccordion = ({ title, groups = [], ...props }: GroupsAccordionProps) => {
	const [checked, setChecked] = useState(false);
	const isAdmin = ProjectsHooksSelectors.selectIsProjectAdmin();

	const groupsCount = groups.length;

	const toggleCheckbox = (e) => {
		e.stopPropagation();
		setChecked(!checked);
	};

	return (
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
			{...props}
		>
			{groupsCount ? (
				<Groups groups={groups} />
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
	);
};
