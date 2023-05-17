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

import { ActionMenu } from '@controls/actionMenu';
import AddCircleIcon from '@assets/icons/outlined/add_circle-outlined.svg';
import { FormattedMessage } from 'react-intl';
import { NewGroupButton } from './addGroupButton.styles';
import { GroupSettingsForm } from './groupSettingsForm.component.tsx/groupSettingsForm.component';

type IAddGroupButton = {
	colored: boolean;
};

export const AddGroupButton = ({ colored }: IAddGroupButton) => {
	console.time('add group');
	return (
		<ActionMenu
			TriggerButton={(
				<NewGroupButton startIcon={<AddCircleIcon />}>
					<FormattedMessage
						id="ticketCard.groups.addGroup"
						defaultMessage="Add group"
					/>
				</NewGroupButton>
			)}
		>
			<span>
				Create Group
				<GroupSettingsForm />
			</span>
		</ActionMenu>
	);
};
