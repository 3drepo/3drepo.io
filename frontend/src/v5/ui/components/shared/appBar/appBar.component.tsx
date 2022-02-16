/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import React, { MouseEvent, useState } from 'react';
import { AppBar as MuiAppBar, Avatar, ClickAwayListener, Grow, Paper } from '@material-ui/core';

import LogoIcon from '@assets/icons/logo.svg';
import IntercomIcon from '@assets/icons/intercom.svg';
import NotificationsIcon from '@assets/icons/notifications.svg';
import { CircleButton } from '@/v5/ui/controls/circleButton';
import { AvatarButton } from '@/v5/ui/controls/avatarButton';
import ContactUsIcon from '@assets/icons/email.svg';
import InviteAFriendIcon from '@assets/icons/add_user.svg';
import TeamspacesIcon from '@assets/icons/teamspaces.svg';
import VisualSettingsIcon from '@assets/icons/settings.svg';
import SupportCentreIcon from '@assets/icons/question_mark.svg';
// import { UsersHooksSelectors } from '@/v5/services/selectorsHooks/usersSelectors.hooks';
// import { useParams } from 'react-router';
import {
	Items,
	UserMenu,
	Section,
	AvatarSection,
	Popper,
	UserFullName,
	UserUserName,
	SignOutButton,
	EditProfileButton,
} from './appBar.styles';
import { Breadcrumbs } from '../breadcrumbs';
import { UserMenuButton } from './userMenuButton/userMenuButton.component';

const getUserNameInitials = (name: string) => (
	name.split(' ')
		.map((n) => n.charAt(0).trim().toUpperCase())
		.join('')
);

export const AppBar = (): JSX.Element => {
	// const { teamspace } = useParams();
	const user = {
		hasAvatar: false,
		user: 'Alessandro Local',
		firstName: 'Alessandro',
		lastName: 'Local',
	}; // UsersHooksSelectors.selectUser(teamspace, "AlessandroLocal");
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	const handleCloseDropdown = () => {
		setAnchorEl(null);
	};

	const handleClickDropdown = (event: MouseEvent<HTMLButtonElement>) => {
		event.stopPropagation();
		setAnchorEl(event.currentTarget);
	};

	return (
		<>
			<MuiAppBar position="static">
				<Items>
					<LogoIcon />
					<Breadcrumbs />
				</Items>
				<Items>
					<CircleButton variant="contrast" aria-label="intercom">
						<IntercomIcon />
					</CircleButton>
					<CircleButton variant="contrast" aria-label="notifications">
						<NotificationsIcon />
					</CircleButton>
					<AvatarButton
						onClick={handleClickDropdown}
					>
						{user?.hasAvatar ? (
							<img src="" alt="avatar" />
						) : (
							<span>{getUserNameInitials(user.user)}</span>
						)}
					</AvatarButton>
				</Items>
			</MuiAppBar>
			<Popper
				open={Boolean(anchorEl)}
				anchorEl={anchorEl}
				transition
				disablePortal
				placement="bottom-end"
			>
				{({ TransitionProps, placement }) => (
					<Grow
						{...TransitionProps}
						style={{ transformOrigin: placement === 'bottom-end' ? 'center top' : 'center bottom' }}
					>
						<Paper>
							<ClickAwayListener onClickAway={handleCloseDropdown}>
								<UserMenu>
									<AvatarSection>
										<Avatar>
											{user?.hasAvatar ? (
												<img src="" alt="avatar" />
											) : (
												<span>{getUserNameInitials(user.user)}</span>
											)}
										</Avatar>
										<UserFullName>{user.firstName} {user.lastName}</UserFullName>
										<UserUserName>{user.user}</UserUserName>
										<EditProfileButton
											onClick={handleCloseDropdown}
										>
											Edit your profile
										</EditProfileButton>
									</AvatarSection>
									<Section>
										<UserMenuButton
											Icon={TeamspacesIcon}
											label="Teamspaces"
											onClickClose={handleCloseDropdown}
											onClick={() => {}}
										/>
										<UserMenuButton
											Icon={VisualSettingsIcon}
											label="Visual Settings"
											onClickClose={handleCloseDropdown}
											onClick={() => {}}
										/>
									</Section>
									<Section>
										<UserMenuButton
											Icon={SupportCentreIcon}
											label="Support centre"
											onClickClose={handleCloseDropdown}
											onClick={() => {}}
										/>
										<UserMenuButton
											Icon={ContactUsIcon}
											label="Contact us"
											onClickClose={handleCloseDropdown}
											onClick={() => {}}
										/>
										<UserMenuButton
											Icon={InviteAFriendIcon}
											label="Invite a friend"
											onClickClose={handleCloseDropdown}
											onClick={() => {}}
										/>
									</Section>
									<Section>
										<SignOutButton>Sign out</SignOutButton>
									</Section>
								</UserMenu>
							</ClickAwayListener>
						</Paper>
					</Grow>
				)}
			</Popper>
		</>
	);
};
