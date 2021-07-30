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

import { ButtonMenu } from '../../../../components/buttonMenu/buttonMenu.component';
import { MenuButton as MenuButtonComponent } from '../../../../components/menuButton/menuButton.component';

export interface IMenuButton {
	hidden?: boolean;
	label?: string;
	content?: (props?) => React.ReactNode;
	disabled?: boolean;
	open?: boolean;
	onClose?: () => void;
	onOpen?: () => void;
}

export const MenuButton: React.FunctionComponent<IMenuButton> = ({
	hidden, label, content, disabled = false, open, onOpen, onClose
}) => {
	const renderButton = (props) => (
		<MenuButtonComponent ariaLabel={label} hidden={hidden} widened={1} disableGutters {...props} />
	);

	return (
		<ButtonMenu
			renderButton={renderButton}
			renderContent={content}
			PaperProps={{ style: { overflow: 'initial', boxShadow: 'none' } }}
			PopoverProps={{ anchorOrigin: { vertical: 'center', horizontal: 'left' } }}
			ButtonProps={{ disabled }}
			open={open}
			onClose={onClose}
			onOpen={onOpen}
		/>
	);
};
