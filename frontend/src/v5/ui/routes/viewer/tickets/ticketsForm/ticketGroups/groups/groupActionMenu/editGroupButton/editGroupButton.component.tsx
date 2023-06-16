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

import EditIcon from '@assets/icons/outlined/edit-outlined.svg';
import { IGroupSettingsForm } from '@/v5/store/tickets/tickets.types';
import { PrimaryTicketButton } from '../../../../../ticketButton/ticketButton.styles';
import { GroupSettingsForm } from '../groupSettingsForm/groupSettingsForm.component';
import { TicketsGroupActionMenu } from '../groupActionMenu.component';

export const EditGroupButton = ({ defaultValues }: { defaultValues?: IGroupSettingsForm }) => (
	<TicketsGroupActionMenu
		TriggerButton={(
			<PrimaryTicketButton>
				<EditIcon />
			</PrimaryTicketButton>
		)}
	>
		<GroupSettingsForm value={defaultValues} />
	</TicketsGroupActionMenu>
);
