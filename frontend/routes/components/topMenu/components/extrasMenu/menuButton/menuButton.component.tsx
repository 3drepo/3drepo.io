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

import { BurgerIcon } from '../extrasMenu.styles';
import { StyledIconButton } from './menuButton.styles';

interface IProps {
	IconProps?: any;
	Icon?: any;
	isMenuOpen?: boolean;
	buttonRef?: any;
}

export class MenuButton extends React.PureComponent<IProps, any> {
	public render() {
		const { IconProps, Icon, isMenuOpen, ...props} = this.props;

		return (
				<StyledIconButton
						{...props}
						active={Number(isMenuOpen)}
						aria-label="Toggle user menu"
						aria-haspopup="true"
				>
					<BurgerIcon {...IconProps} size="small" />
				</StyledIconButton>
		);
	}
}
