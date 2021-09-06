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

import React, { Dispatch } from 'react';

import { StyledFab } from './circleButton.styles';

interface ICircleButton {
	size?: 'large' | 'medium' | 'small';
	variant?: 'main' | 'contrast';
	onClick: Dispatch<void>;
	disabled?: boolean;
	className?: string;
}

export const CircleButton: React.FC<ICircleButton> = ({
	size = 'large',
	variant = 'main',
	onClick,
	children,
	...props
}) => (
	<StyledFab onClick={onClick} size={size} variant={variant} {...props}>
		{children}
	</StyledFab>
);
