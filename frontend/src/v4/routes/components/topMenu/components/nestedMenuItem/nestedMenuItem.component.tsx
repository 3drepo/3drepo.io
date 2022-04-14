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
import { FunctionComponent, ReactNode } from 'react';
import { ButtonMenu } from '../../../buttonMenu/buttonMenu.component';
import { MenuButton } from './menuButton/menuButton.component';

interface IProps {
	children?: ReactNode;
	renderContent?: ReactNode;
	icon?: ReactNode;
	label: string;
}

export const NestedMenuItem: FunctionComponent<IProps> = ({ children, label, renderContent, icon }) => {
	const renderSubMenuContent = () => renderContent || children;

	const renderButton = ({ ...props }) => <MenuButton label={label} icon={icon} {...props} />;

	return (
		<ButtonMenu
			renderButton={renderButton}
			renderContent={renderSubMenuContent}
			PopoverProps={{
				anchorOrigin: {
					vertical: 'top',
					horizontal: 'left'
				},
				transformOrigin: {
					vertical: 'top',
					horizontal: 'right',
				}
			}}
		/>
	);
};
