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

import { ButtonMenu } from '../../../buttonMenu/buttonMenu.component';
import { getNormalizedUserData, ICurrentUser } from './mainMenu.helpers';
import { MainMenuButton } from './mainMenuButton/mainMenuButton.component';
import { MenuContent } from './menuContent/menuContent.component';

interface IProps {
	children?: React.ReactNode;
	isAuthenticated: boolean;
	currentUser?: ICurrentUser;
	onTeamspacesClick?: () => void;
	onSettingClick?: () => void;
	isInitialised?: boolean;
	id?: string;
}

export const MainMenu: React.FunctionComponent<IProps> =
		({ isAuthenticated, isInitialised, currentUser, id, ...mainMenuProps }) => {

	const renderMenuContent = (props) => {
		const menuContentProps = {
			...props,
			...mainMenuProps,
			isAuthenticated,
			userData: currentUser && getNormalizedUserData(currentUser),
		};

		return <MenuContent {...menuContentProps} />;
	};

	const renderButton = ({ ...props }) => (
		<MainMenuButton
			{...props}
			id={id}
			userData={currentUser && getNormalizedUserData(currentUser)}
			isInitialised={isInitialised}
			isAuthenticated={isAuthenticated}
		/>
	);

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
