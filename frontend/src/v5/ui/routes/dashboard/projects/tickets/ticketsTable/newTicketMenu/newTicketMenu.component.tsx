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

import { ContainersHooksSelectors, FederationsHooksSelectors } from '@/v5/services/selectorsHooks';
import { sortByName } from '@/v5/store/store.helpers';
import { ActionMenu, ActionMenuItem } from '@controls/actionMenu';
import { ActionMenuProps } from '@controls/actionMenu/actionMenu.component';
import { FormattedMessage } from 'react-intl';
import { MenuList, MenuItem } from '@mui/material';
import { useSearchParam } from '@/v5/ui/routes/useSearchParam';
import { Label } from './newTicketMenu.styles';

type NewTicketMenuProps = Omit<ActionMenuProps, 'children'> & {
	onContainerOrFederationClick: (id: string) => void;
};
export const NewTicketMenu = ({ onContainerOrFederationClick, TriggerButton, ...props }: NewTicketMenuProps) => {
	const [models] = useSearchParam('models');
	const containers = ContainersHooksSelectors.selectContainers();
	const federations = FederationsHooksSelectors.selectFederations();

	const selectableModels = [...containers, ...federations].filter(({ _id }) => models?.includes(_id));

	if (selectableModels.length === 1) {
		return (
			<div onClick={() => onContainerOrFederationClick(selectableModels[0]._id)}>
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
				{sortByName(selectableModels).map(({ _id, name }) => (
					<ActionMenuItem key={_id}>
						<MenuItem onClick={() => onContainerOrFederationClick(_id)}>
							{name}
						</MenuItem>
					</ActionMenuItem>
				))}
			</MenuList>
		</ActionMenu>
	);
};
