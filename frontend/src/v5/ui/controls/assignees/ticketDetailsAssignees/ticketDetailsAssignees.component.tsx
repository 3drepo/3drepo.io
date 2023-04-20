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
import AddUserIcon from '@assets/icons/outlined/add_user-outlined.svg';
import { Tooltip } from '@mui/material';
import { FormInputProps } from '@controls/inputs/inputController.component';
import { formatMessage } from '@/v5/services/intl';
import { AddUserButton, AssigneesList, InlineAssignees } from './ticketDetailsAssignees.styles';
import { AssigneesSelectMenu } from '../assigneesSelectMenu/assigneesSelectMenu.component';

export const TicketDetailsAssignees = ({ value, disabled, onBlur, ...props }: FormInputProps) => {
	const [open, setOpen] = useState(false);
	const handleOpen = () => {
		if (disabled) return;
		setOpen(true);
	};
	const handleClose = () => {
		setOpen(false);
		onBlur();
	};

	return (
		<InlineAssignees disabled={disabled}>
			<AssigneesSelectMenu
				open={open}
				value={value}
				values="jobsAndUsers"
				onClose={handleClose}
				onOpen={handleOpen}
				{...props}
			/>
			<AssigneesList onClick={handleOpen} values={value} maxItems={3} />
			<Tooltip
				title={formatMessage({
					id: 'customTicket.topPanel.addAssignees.tooltip',
					defaultMessage: 'Assign',
				})}
				arrow
			>
				<div>
					<AddUserButton onClick={handleOpen}>
						<AddUserIcon />
					</AddUserButton>
				</div>
			</Tooltip>
		</InlineAssignees>
	);
};
