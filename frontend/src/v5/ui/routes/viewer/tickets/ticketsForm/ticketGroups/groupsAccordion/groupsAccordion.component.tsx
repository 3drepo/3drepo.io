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

import { useContext, useEffect } from 'react';
import GroupsIcon from '@mui/icons-material/GroupWork';
import { FormattedMessage } from 'react-intl';
import { EmptyListMessage } from '@controls/dashedContainer/emptyListMessage/emptyListMessage.styles';
import { ProjectsHooksSelectors, TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import AddCircleIcon from '@assets/icons/outlined/add_circle-outlined.svg';
import { Accordion, NumberContainer, TitleContainer, Checkbox, NewGroupButton } from './groupsAccordion.styles';
import { Groups } from '../groups/groups.component';
import { TicketGroupsContext } from '../ticketGroupsContext';
import { GroupState, getCollectionCheckboxState } from '../ticketGroupsContext.helper';

type GroupsAccordionProps = { title: any };
export const GroupsAccordion = ({ title }: GroupsAccordionProps) => {
	const {
		getCollectionState,
		setCollectionIsChecked,
		indexedOverrides,
		editGroup,
		groupType,
	} = useContext(TicketGroupsContext);
	const isAdmin = ProjectsHooksSelectors.selectIsProjectAdmin();
	const indexes = indexedOverrides.map(({ index }) => index);
	const overridesCount = indexedOverrides.length;
	const state = getCollectionState(indexes);

	const toggleCheckbox = (e) => {
		e.stopPropagation();
		setCollectionIsChecked(indexes, state !== GroupState.CHECKED);
	};

	const addNewGroup = (e) => {
		e.stopPropagation();
		editGroup(overridesCount); // Set the edit mode with a new index
	};

	if (groupType === 'colored') {
		const hasOverrides = TicketsCardHooksSelectors.selectTicketHasOverrides();

		useEffect(() => {
			console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
			console.log(JSON.stringify({ hasOverrides }, null, '\t'));

			if (hasOverrides) return;
			setCollectionIsChecked(indexes, false);
		}, [hasOverrides]);
	}

	return (
		<Accordion
			Icon={GroupsIcon}
			title={(
				<TitleContainer>
					{title}
					<NumberContainer>{overridesCount}</NumberContainer>
					<Checkbox {...getCollectionCheckboxState(state)} onClick={toggleCheckbox} />
				</TitleContainer>
			)}
			$overridesCount={overridesCount}
		>
			{overridesCount ? (
				<Groups indexedOverrides={indexedOverrides} />
			) : (
				<EmptyListMessage>
					<FormattedMessage
						id="ticketCard.groupsList.empty"
						defaultMessage="No Groups"
					/>
				</EmptyListMessage>
			)}
			{isAdmin
			&& (
				<NewGroupButton startIcon={<AddCircleIcon />} onClick={addNewGroup}>
					<FormattedMessage
						id="ticketCard.groups.addGroup"
						defaultMessage="Add group"
					/>
				</NewGroupButton>
			)}
		</Accordion>
	);
};
