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

import { isCommenterRole, sortByName } from '@/v5/store/store.helpers';
import { ActionMenu, ActionMenuItem } from '@controls/actionMenu';
import { ActionMenuProps } from '@controls/actionMenu/actionMenu.component';
import { FormattedMessage } from 'react-intl';
import { MenuList, MenuItem } from '@mui/material';
import { Label } from './newTicketMenu.styles';
import { useSelectedModels } from './useSelectedModels';

type NewTicketMenuProps = Omit<ActionMenuProps, 'children'> & {
	onContainerOrFederationClick: (id: string) => void;
};
export const NewTicketMenu = ({ onContainerOrFederationClick, TriggerButton, ...props }: NewTicketMenuProps) => {
	const selectableModels = useSelectedModels();

	if (selectableModels.length === 1) {
		const handleClick = () => {
			if (props.disabled) return;
			onContainerOrFederationClick(selectableModels[0]._id);
		};

		return (
			<div onClick={handleClick}>
				{TriggerButton}
			</div>
		);
	}

	return (
		<ActionMenu TriggerButton={TriggerButton} PopoverProps={{ style: { maxHeight: 400 } }} {...props}>
			<MenuList>
				<Label onClick={(e) => e.preventDefault()}>
					<FormattedMessage id="ticketTable.newTicket.select" defaultMessage="Select a Federation or Container" />
				</Label>
				{sortByName(selectableModels).map(({ _id, name, role }) => (
					<ActionMenuItem key={_id}>
						<MenuItem
							onClick={() => onContainerOrFederationClick(_id)}
							disabled={!isCommenterRole(role)}
						>
							{name}
						</MenuItem>
					</ActionMenuItem>
				))}
			</MenuList>
		</ActionMenu>
	);
};
