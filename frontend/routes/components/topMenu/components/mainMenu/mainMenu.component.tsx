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

import * as React from 'react';

import { Avatar } from '../../../avatar/avatar.component';
import { ButtonMenu } from '../../../buttonMenu/buttonMenu.component';
import { StyledIconButton } from './mainMenu.styles';
import { MenuContent } from './menuContent/menuContent.component';

interface IUserButtonProps {
	userData: {
		name: string,
		avatarUrl: string,
		username: string,
	};
	isMenuOpen: boolean;
	IconProps: any;
	Icon: React.ReactNode;
}

const UserButton: React.FunctionComponent<IUserButtonProps> =
		({ IconProps, Icon, isMenuOpen, userData: { name, avatarUrl }, ...props }: IUserButtonProps) => (
		<StyledIconButton
			{...props}
			active={Number(isMenuOpen)}
			aria-label="Toggle user menu"
			aria-haspopup="true"
		>
			<Avatar
				name={name}
				size={26}
				url={avatarUrl}
				fontSize={12}
			/>
		</StyledIconButton>
);

interface IProps {
	children?: React.ReactNode;
	isAuthenticated: boolean;
	currentUser?: {
		username: string,
		avatarUrl: string,
		firstName: string,
		lastName: string,
	};
	onTeamspacesClick?: () => void;
	onSettingClick?: () => void;
}

export const MainMenu: React.FunctionComponent<IProps> =
		({ isAuthenticated, currentUser, ...mainMenuProps }) => {

	const getCurrentUserData = () => {
		const { username, avatarUrl, firstName, lastName } = currentUser;
		const name = firstName || lastName ? `${firstName || ''} ${lastName || ''}`.trim() : username;

		return {
			name,
			username,
			avatarUrl,
		};
	};

	const renderMenuContent = (props) => {
		const menuContentProps = {
			...props,
			...mainMenuProps,
			isAuthenticated,
			userData: getCurrentUserData(),
		};

		return <MenuContent {...menuContentProps} />;
	};

	const renderButton = ({ ...props }) => <UserButton userData={getCurrentUserData()} {...props} />;

	return (
		<ButtonMenu
			ripple
			renderButton={renderButton}
			renderContent={renderMenuContent}
			PopoverProps={{
				anchorOrigin: {
					vertical: 'bottom',
					horizontal: 'right'
				}
			}}
		/>
	);
};
