/**
 *  Copyright (C) 2026 3D Repo Ltd
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

import AddCircleIcon from '@assets/icons/filled/add_circle-filled.svg';
import { Button } from '@controls/button';
import { SubmitButton } from '@controls/submitButton';
import { MenuItem } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { useState } from 'react';
import {
	AddGroupButtonBase,
	AddGroupActions,
	AddGroupPopover,
	GroupFunctionSelect,
} from './addGroupButton.styles';
import {
	FormBox,
	Heading,
	Subheading,
} from '../../ticketsForm/ticketGroups/groups/groupActionMenu/ticketGroupForm/ticketGroupForm.styles';
import { OverrideType } from '@/v5/store/tickets/tickets.types';


type AddGroupButtonProps = {
	newGroupsHandle: React.RefObject<any>;
};

export const AddGroupButton = ({ newGroupsHandle }: AddGroupButtonProps) => {
	const { formatMessage } = useIntl();
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const [groupFunction, setGroupFunction] = useState('');

	const createGroup = () => {
		if (!groupFunction) return;
		newGroupsHandle.current?.triggerNewGroup(groupFunction as OverrideType)();
		setAnchorEl(null);
	};

	return (
		<>
			<AddGroupButtonBase
				startIcon={<AddCircleIcon />}
				onClick={(event) => {
					event.stopPropagation();
					const cardHeader = event.currentTarget.parentElement?.parentElement;
					setAnchorEl(anchorEl ? null : cardHeader);
				}}
			>
				<FormattedMessage id="ticketCard.groups.addGroup" defaultMessage="Add group" />
			</AddGroupButtonBase>
			<AddGroupPopover
				open={Boolean(anchorEl)}
				anchorEl={anchorEl}
				onClose={() => setAnchorEl(null)}
				anchorOrigin={{
					vertical: 'top',
					horizontal: 'right',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'left',
				}}
			>
				<Heading>
					<FormattedMessage id="ticketCard.groups.addGroup.heading" defaultMessage="Add new group" />
				</Heading>
				<Subheading>
					<FormattedMessage id="ticketCard.groups.addGroup.groupInformation" defaultMessage="Group Information" />
				</Subheading>
				<FormBox>
					<GroupFunctionSelect
						label={formatMessage({ id: 'ticketCard.groups.addGroup.groupFunction.label', defaultMessage: 'Group Function' })}
						required
						value={groupFunction}
						onChange={(event) => setGroupFunction(event.target.value as string)}
						displayEmpty
						renderValue={(value) =>
							(value as string) ||
							formatMessage({ id: 'ticketCard.groups.addGroup.groupFunction.placeholder', defaultMessage: 'Select group function' })
						}
					>
						<MenuItem value={OverrideType.COLORED}>
							<FormattedMessage id="ticketCard.groups.addGroup.groupFunction.coloured" defaultMessage="Coloured" />
						</MenuItem>
						<MenuItem value={OverrideType.SELECTED}>
							<FormattedMessage id="ticketCard.groups.addGroup.groupFunction.selected" defaultMessage="Selected" />
						</MenuItem>
						<MenuItem value={OverrideType.HIDDEN}>
							<FormattedMessage id="ticketCard.groups.addGroup.groupFunction.hidden" defaultMessage="Hidden" />
						</MenuItem>
						<MenuItem value={OverrideType.SHOWN}>
							<FormattedMessage id="ticketCard.groups.addGroup.groupFunction.shown" defaultMessage="Shown" />
						</MenuItem>
					</GroupFunctionSelect>
				</FormBox>
				<AddGroupActions>
					<Button variant="text" color="secondary" onClick={() => setAnchorEl(null)}>
						<FormattedMessage id="tickets.groups.settings.cancel" defaultMessage="Cancel" />
					</Button>
					<SubmitButton fullWidth={false} disabled={!groupFunction} onClick={createGroup}>
						<FormattedMessage id="tickets.groups.settings.createGroup" defaultMessage="Create group" />
					</SubmitButton>
				</AddGroupActions>
			</AddGroupPopover>
		</>
	);
};
