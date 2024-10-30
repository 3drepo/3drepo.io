/**
 *  Copyright (C) 2022 3D Repo Ltd
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

import GroupsIcon from '@assets/icons/outlined/groups-outlined.svg';
import { FormattedMessage } from 'react-intl';
import { ViewpointState } from '@/v5/store/tickets/tickets.types';
import { EllipsisMenu } from '@controls/ellipsisMenu';
import { EllipsisMenuItem } from '@controls/ellipsisMenu/ellipsisMenuItem';
import { EllipsisMenuItemDelete } from '../../../ticketImageContent/ticketImageAction/ticketImageAction.styles';
import { ViewActionMenu } from '../viewActionMenu.component';

type IGroupsActionMenu = {
	value: ViewpointState;
	onDelete: (newValue) => void;
	onClick: () => void;
	disabled?: boolean;
};

export const GroupsActionMenu = ({
	value,
	onDelete,
	onClick,
	disabled,
}: IGroupsActionMenu) => {
	const hasGroups = value?.colored?.length || value?.hidden?.length;

	return (
		<ViewActionMenu
			disabled={!hasGroups}
			onClick={onClick}
			Icon={GroupsIcon}
			title={<FormattedMessage id="viewer.card.ticketView.actionMenu.groups" defaultMessage="Groups" />}
		>
			<EllipsisMenu disabled={disabled && !hasGroups}>
				<EllipsisMenuItem
					title={(<FormattedMessage id="viewer.card.ticketView.action.addNewGroup" defaultMessage="Add new group" />)}
					onClick={onClick}
					disabled={disabled}
				/>
				<EllipsisMenuItem
					title={(<FormattedMessage id="viewer.card.ticketView.action.viewGroups" defaultMessage="View groups" />)}
					onClick={onClick}
					hidden={!hasGroups}
				/>
				<EllipsisMenuItemDelete
					title={(<FormattedMessage id="viewer.card.ticketView.action.deleteGroups" defaultMessage="Delete groups" />)}
					onClick={onDelete}
					hidden={!hasGroups}
					disabled={disabled}
				/>
			</EllipsisMenu>
		</ViewActionMenu>
	);
};
