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

import { useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { EmptyListMessage } from '@controls/dashedContainer/emptyListMessage/emptyListMessage.styles';
import { OverrideType } from '@/v5/store/tickets/tickets.types';
import ColoredGroupsIcon from '@assets/icons/outlined/boxes-outlined.svg';
import HiddenGroupsIcon from '@assets/icons/outlined/boxes_disabled-outlined.svg';
import { Accordion, NumberContainer, TitleContainer } from './groupsAccordion.styles';
import { Groups } from '../groups/groups.component';
import { GroupOverrideAction } from '../groupOverrideAction/groupOverrideAction.component';
import { TicketGroupsContext } from '../ticketGroupsContext';
import { getCollectionCheckboxState } from '../ticketGroupsContext.helper';

type GroupsAccordionProps = { title: any };
export const GroupsAccordion = ({ title }: GroupsAccordionProps) => {
	const {
		getCollectionState,
		overrides,
		groupType,
		onOverrideAction,
	} = useContext(TicketGroupsContext);
	
	// const hasClearedOverrides = TicketsCardHooksSelectors.selectTicketHasClearedOverrides();
	const keys = overrides.map(({ key }) => key);
	const overridesCount = overrides.length;
	const state = getCollectionState(keys);
	const isColored = groupType === OverrideType.COLORED;

	const onOverrideClick = (e) => {
		e.stopPropagation();
		onOverrideAction(keys);
	};

	return (
		<Accordion
			Icon={isColored ? ColoredGroupsIcon : HiddenGroupsIcon}
			title={(
				<TitleContainer>
					{title}
					<NumberContainer>{overridesCount}</NumberContainer>
					<GroupOverrideAction {...getCollectionCheckboxState(state)} onClick={onOverrideClick} />
				</TitleContainer>
			)}
			$overridesCount={overridesCount}
			$isHiddenGroups={!isColored}
		>
			{overridesCount ? (
				<Groups overrides={overrides} />
			) : (
				<EmptyListMessage>
					<FormattedMessage
						id="ticketCard.groupsList.empty"
						defaultMessage="No Groups"
					/>
				</EmptyListMessage>
			)}
		</Accordion>
	);
};
