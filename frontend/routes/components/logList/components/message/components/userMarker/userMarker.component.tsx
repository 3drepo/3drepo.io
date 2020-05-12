/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import React from 'react';

import { Popover } from '../markdownMessage/issueReference/issueReference.styles';
import { UserAvatar } from '../userAvatar';
import { UserPopover } from '../userPopover/userPopover.component';
import { UserIndicator } from './userMarker.styles';

interface IProps {
	name: string;
	teamspace: string;
	children?: React.ReactNode;
	usersCachedResponses: any[];
	fetchUserDetails: (teamspace, username) => void;
}

export const UserMarker = ({ name, children, teamspace, fetchUserDetails, usersCachedResponses }: IProps) => {
	const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
	const open = Boolean(anchorEl);

	React.useEffect(() => {
		fetchUserDetails(teamspace, name);
	}, [fetchUserDetails, teamspace, name]);

	const currentUser = usersCachedResponses[`${teamspace}-${name}`];

	const handlePopoverOpen = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
		setAnchorEl(event.currentTarget);
	};

	const handlePopoverClose = () => {
		setAnchorEl(null);
	};

	return (
		<>
			<UserIndicator
				aria-haspopup="true"
				onMouseEnter={handlePopoverOpen}
				onMouseLeave={handlePopoverClose}
			>
				{children || <UserAvatar name={name} currentUser={currentUser} />}
			</UserIndicator>
			<Popover
				id="mouse-over-popover"
				open={open}
				anchorEl={anchorEl}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'center',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'left',
				}}
				onClose={handlePopoverClose}
				disableRestoreFocus
			>
				{currentUser && <UserPopover user={currentUser}>
					<UserAvatar name={name} currentUser={currentUser} />
				</UserPopover>}
			</Popover>
		</>
	);
};
