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

import * as React from 'react';

import { renderWhenTrue } from '../../../../../../helpers/rendering';
import { Avatar } from '../../../../avatar/avatar.component';
import { IUserData } from '../mainMenu.helpers';
import { BurgerIcon, StyledIconButton } from './mainMenuButton.styles';

interface IUserButtonProps {
	isAuthenticated: boolean;
	isInitialised?: boolean;
	userData?: IUserData;
	isMenuOpen?: boolean;
	IconProps?: any;
	Icon?: React.ReactNode;
	id?: string;
}

export const MainMenuButton: React.FunctionComponent<IUserButtonProps> =
	({ IconProps, Icon, isAuthenticated, isInitialised, isMenuOpen, userData, ...props }: IUserButtonProps) => {

	const renderAvatar = renderWhenTrue(() => (
		<Avatar
			name={userData.name}
			size={26}
			loading={!isInitialised}
			url={userData.avatarUrl}
			fontSize={13}
		/>
	));

	const renderBurger = renderWhenTrue(() => (
		<BurgerIcon {...IconProps} size="small" />
	));

	return (
		<StyledIconButton
			{...props}
			active={isMenuOpen ? 1 : 0}
			aria-label="Toggle main menu"
			aria-haspopup="true"
		>
			{renderAvatar(isAuthenticated)}
			{renderBurger(!isAuthenticated)}
		</StyledIconButton>
	);
};
