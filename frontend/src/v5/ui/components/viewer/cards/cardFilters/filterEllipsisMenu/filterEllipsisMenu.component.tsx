/**
 *  Copyright (C) 2025 3D Repo Ltd
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

import EllipsisIcon from '@assets/icons/outlined/ellipsis-outlined.svg';
import { CardAction } from '../../cardAction/cardAction.styles';
import { MenuList, Tooltip } from '@mui/material';
import { formatMessage } from '@/v5/services/intl';
import PinIcon from '@assets/icons/filled/pin_ticket-filled.svg';
import { TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { TicketsCardActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { ActionMenu } from '@controls/actionMenu';
import { SwitchContainer } from './filterEllipsisMenu.styles';
import { EllipsisMenuItem } from '@controls/ellipsisMenu/ellipsisMenuItem';
import TickIcon from '@assets/icons/outlined/tick-outlined.svg';

export const FilterEllipsisMenu = () => {
	const isShowingPins = TicketsCardHooksSelectors.selectIsShowingPins();
	const onClickShowPins = () => TicketsCardActionsDispatchers.setIsShowingPins(!isShowingPins);

	return (
		<ActionMenu
			TriggerButton={(
				<Tooltip title={formatMessage({ id: 'viewer.cards.tickets.moreOptions', defaultMessage: 'More options' })}>
					<CardAction>
						<EllipsisIcon />
					</CardAction>
				</Tooltip>
			)}
		>
			<MenuList>
				<EllipsisMenuItem
					onClick={onClickShowPins}
					title={
						<SwitchContainer>
							<PinIcon />
							{formatMessage({ id: 'viewer.cards.tickets.showPins', defaultMessage: 'Show Pins' })}
							{isShowingPins && <TickIcon />}
						</SwitchContainer>
					}
				/>
			</MenuList>
		</ActionMenu>
	);
};