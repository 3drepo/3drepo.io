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

import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import { COLOR } from '../../../../../../styles';
import { MenuIcon, MenuItem, MenuText } from '../../mainMenu/menuContent/menuContent.styles';

interface IProps {
	IconProps?: any;
	Icon?: any;
	icon?: React.ReactNode;
	label: string;
}

export const MenuButton: React.FunctionComponent<IProps> = ({ IconProps, Icon, label, icon, ...props }) => (
	<MenuItem
		{...props}
		button
		aria-label={label}
		disableRipple
	>
		<MenuIcon>
			{icon}
		</MenuIcon>
		<MenuText icon="true">
			{label}
		</MenuText>
		<ArrowRightIcon style={{ color: COLOR.BLACK_54 }} {...IconProps} />
	</MenuItem>
);
