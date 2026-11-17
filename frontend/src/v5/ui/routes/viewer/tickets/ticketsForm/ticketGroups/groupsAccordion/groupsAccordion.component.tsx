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
import { FormattedMessage } from 'react-intl';
import { EmptyListMessage } from '@controls/dashedContainer/emptyListMessage/emptyListMessage.styles';
import { TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import ColoredGroupsIcon from '@assets/icons/outlined/boxes-outlined.svg';
import HiddenGroupsIcon from '@assets/icons/outlined/boxes_disabled-outlined.svg';
import { Accordion, NumberContainer, TitleContainer, Checkbox } from './groupsAccordion.styles';
import { Groups } from '../groups/groups.component';
import { TicketGroupsContext } from '../ticketGroupsContext';
import { GroupState, getCollectionCheckboxState } from '../ticketGroupsContext.helper';

type GroupsAccordionProps = { title: any };
export const GroupsAccordion = ({ title }: GroupsAccordionProps) => {
	const {
		getCollectionState,
		setCollectionIsChecked,
		overrides,
		groupType,
		highlightedKey,
		clearHighlightedKey,
	} = useContext(TicketGroupsContext);
	
	const hasClearedOverrides = TicketsCardHooksSelectors.selectTicketHasClearedOverrides();
	const keys = overrides.map(({ key }) => key);
	const overridesCount = overrides.length;
	const state = getCollectionState(keys);
	const isColored = groupType === 'colored';

	const toggleCheckbox = (e) => {
		e.stopPropagation();
		setCollectionIsChecked(keys, state !== GroupState.CHECKED);
	};

	useEffect(() => {
		if (!isColored || !hasClearedOverrides) return;
		setCollectionIsChecked(keys, false);
		if (highlightedKey) {
			clearHighlightedKey();
		}
	}, [hasClearedOverrides]);

	return (
		<Accordion
			Icon={isColored ? ColoredGroupsIcon : HiddenGroupsIcon}
			title={(
				<TitleContainer>
					{title}
					<NumberContainer>{overridesCount}</NumberContainer>
					<Checkbox {...getCollectionCheckboxState(state)} onClick={toggleCheckbox} />
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
