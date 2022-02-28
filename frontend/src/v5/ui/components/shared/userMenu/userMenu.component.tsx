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

import React from 'react';
import { useParams } from 'react-router';
import { useRouteMatch } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import ContactUsIcon from '@assets/icons/email.svg';
import InviteAFriendIcon from '@assets/icons/add_user.svg';
import TeamspacesIcon from '@assets/icons/teamspaces.svg';
import VisualSettingsIcon from '@assets/icons/settings.svg';
import SupportCentreIcon from '@assets/icons/question_mark.svg';
import { IUser } from '@/v5/store/users/users.redux';
import { Avatar } from '@controls/avatar';
import { ActionMenu, ActionMenuSection, ActionMenuItem, ActionMenuTriggerButton } from '@controls/actionMenu';
import {
	AvatarContainer,
	AvatarSection,
	UserFullName,
	UserUserName,
	SignOutButton,
	EditProfileButton,
} from './userMenu.styles';

type UserMenuProps = {
	user: IUser;
};

export const UserMenu = ({ user } : UserMenuProps) => {
	const { teamspace } = useParams();
	const { url } = useRouteMatch();
	const baseUrl = url.split('/').slice(0, 3).join('/');

	return (
		<AvatarContainer>
			<ActionMenu>
				<ActionMenuTriggerButton>
					<Avatar
						user={user}
						isButton
					/>
				</ActionMenuTriggerButton>
				<ActionMenuSection>
					<AvatarSection>
						<Avatar
							user={user}
							largeIcon
						/>
						<UserFullName>{user.firstName} {user.lastName}</UserFullName>
						<UserUserName>{user.user}</UserUserName>
						<ActionMenuItem>
							<EditProfileButton>
								<FormattedMessage
									id="userMenu.editYourProfile"
									defaultMessage="Edit your profile"
								/>
							</EditProfileButton>
						</ActionMenuItem>
					</AvatarSection>
				</ActionMenuSection>
				<ActionMenuSection>
					<ActionMenuItem
						Icon={TeamspacesIcon}
						to={`${baseUrl}/${teamspace}`}
						actionButton
					>
						<FormattedMessage
							id="userMenu.teamspaces"
							defaultMessage="Teamspaces"
						/>
					</ActionMenuItem>
					<ActionMenuItem
						Icon={VisualSettingsIcon}
						actionButton
					>
						<FormattedMessage
							id="userMenu.visualSettings"
							defaultMessage="Visual settings"
						/>
					</ActionMenuItem>
				</ActionMenuSection>
				<ActionMenuSection>
					<ActionMenuItem
						Icon={SupportCentreIcon}
						actionButton
					>
						<FormattedMessage
							id="userMenu.supportCentre"
							defaultMessage="Support centre"
						/>
					</ActionMenuItem>
					<ActionMenuItem
						Icon={ContactUsIcon}
						actionButton
					>
						<FormattedMessage
							id="userMenu.contactUs"
							defaultMessage="Contact us"
						/>
					</ActionMenuItem>
					<ActionMenuItem
						Icon={InviteAFriendIcon}
						actionButton
					>
						<FormattedMessage
							id="userMenu.inviteAFriend"
							defaultMessage="Invite a friend"
						/>
					</ActionMenuItem>
				</ActionMenuSection>
				<ActionMenuSection>
					<ActionMenuItem>
						<SignOutButton>
							<FormattedMessage
								id="userMenu.signOut"
								defaultMessage="Sign out"
							/>
						</SignOutButton>
					</ActionMenuItem>
				</ActionMenuSection>
			</ActionMenu>
		</AvatarContainer>
	);
};
