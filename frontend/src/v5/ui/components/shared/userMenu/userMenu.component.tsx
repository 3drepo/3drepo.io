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

import { FormattedMessage } from 'react-intl';
import { useEffect } from 'react';

import { AuthActionsDispatchers, DialogsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import TeamspacesIcon from '@assets/icons/filled/teamspaces-filled.svg';
import VisualSettingsIcon from '@assets/icons/filled/settings-filled.svg';
import { DASHBOARD_ROUTE } from '@/v5/ui/routes/routes.constants';
import { ICurrentUser } from '@/v5/store/currentUser/currentUser.types';
import { Avatar } from '@controls/avatar';
import { ActionMenuSection, ActionMenuItem, ActionMenuItemLink } from '@controls/actionMenu';
import { selectSettings, ViewerActions } from '@/v4/modules/viewer';
import { CurrentUserHooksSelectors } from '@/v5/services/selectorsHooks';
import { useSelector } from 'react-redux';
import {
	ActionMenu,
	AvatarContainer,
	AvatarSection,
	UserFullName,
	UserUserName,
	SignOutButton,
	EditProfileButton,
	TruncatableName,
} from './userMenu.styles';
import { EditProfileModal } from './editProfileModal/editProfileModal.component';
import { VisualSettingsModal } from './visualSettingsModal/visualSettingsModal.component';
import { dispatch } from '@/v5/helpers/redux.helpers';

type UserMenuProps = {
	user: ICurrentUser;
};

export const UserMenu = ({ user } : UserMenuProps) => {
	const signOut = () => AuthActionsDispatchers.logout();

	const onClickEditProfile = () => DialogsActionsDispatchers.open(EditProfileModal);

	const visualSettings = useSelector(selectSettings);
	const currentUser = CurrentUserHooksSelectors.selectCurrentUser().username;
	const updateSettings = (username, settings) => dispatch(ViewerActions.updateSettings(username, settings));
	const onClickVisualSettings = () => {
		DialogsActionsDispatchers.open(VisualSettingsModal, {
			visualSettings,
			updateSettings,
			currentUser,
		});
	};

	useEffect(() => {
		dispatch(ViewerActions.fetchSettings());
	}, []);

	return (
		<AvatarContainer>
			<ActionMenu TriggerButton={<div><Avatar user={user} isButton /></div>}>
				<ActionMenuSection>
					<AvatarSection>
						<Avatar
							user={user}
							size="medium"
						/>
						<UserFullName>
							<TruncatableName>{user.firstName}</TruncatableName>
								&nbsp;
							<TruncatableName>{user.lastName}</TruncatableName>
						</UserFullName>
						<UserUserName>{user.username}</UserUserName>
						<ActionMenuItem>
							<EditProfileButton onClick={onClickEditProfile}>
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
						to={DASHBOARD_ROUTE}
					>
						<FormattedMessage
							id="userMenu.teamspaces"
							defaultMessage="Teamspaces"
						/>
					</ActionMenuItemLink>
					<ActionMenuItemLink
						Icon={VisualSettingsIcon}
						onClick={onClickVisualSettings}
					>
						<FormattedMessage
							id="userMenu.visualSettings"
							defaultMessage="Visual settings"
						/>
					</ActionMenuItemLink>
				</ActionMenuSection>
				<ActionMenuSection>
					<ActionMenuItem>
						<SignOutButton onClick={signOut}>
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
