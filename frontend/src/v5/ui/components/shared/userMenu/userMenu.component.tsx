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
import { useParams } from 'react-router';
import { useRouteMatch } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import { AuthActionsDispatchers } from '@/v5/services/actionsDispatchers/authActions.dispatchers';
import ContactUsIcon from '@assets/icons/email.svg';
import InviteAFriendIcon from '@assets/icons/add_user.svg';
import TeamspacesIcon from '@assets/icons/teamspaces.svg';
import VisualSettingsIcon from '@assets/icons/settings.svg';
import SupportCentreIcon from '@assets/icons/question_mark.svg';
import { IUser } from '@/v5/store/users/users.redux';
import { Avatar } from '@controls/avatar';
import { ActionMenu, ActionMenuSection, ActionMenuItem, ActionMenuTriggerButton, ActionMenuItemLink } from '@controls/actionMenu';
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

	const onClickSignOut = () => AuthActionsDispatchers.logout();

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
					<ActionMenuItemLink
						Icon={TeamspacesIcon}
						to={`${baseUrl}/${teamspace}`}
					>
						<FormattedMessage
							id="userMenu.teamspaces"
							defaultMessage="Teamspaces"
						/>
					</ActionMenuItemLink>
					<ActionMenuItemLink
						Icon={VisualSettingsIcon}
					>
						<FormattedMessage
							id="userMenu.visualSettings"
							defaultMessage="Visual settings"
						/>
					</ActionMenuItemLink>
				</ActionMenuSection>
				<ActionMenuSection>
					<ActionMenuItemLink
						Icon={SupportCentreIcon}
					>
						<FormattedMessage
							id="userMenu.supportCentre"
							defaultMessage="Support centre"
						/>
					</ActionMenuItemLink>
					<ActionMenuItemLink
						Icon={ContactUsIcon}
					>
						<FormattedMessage
							id="userMenu.contactUs"
							defaultMessage="Contact us"
						/>
					</ActionMenuItemLink>
					<ActionMenuItemLink
						Icon={InviteAFriendIcon}
					>
						<FormattedMessage
							id="userMenu.inviteAFriend"
							defaultMessage="Invite a friend"
						/>
					</ActionMenuItemLink>
				</ActionMenuSection>
				<ActionMenuSection>
					<ActionMenuItem>
						<SignOutButton onClick={onClickSignOut}>
							<FormattedMessage
								id="userMenu.logOut"
								defaultMessage="Log out"
							/>
						</SignOutButton>
					</ActionMenuItem>
				</ActionMenuSection>
			</ActionMenu>
		</AvatarContainer>
	);
};
