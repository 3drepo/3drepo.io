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
import { FC, ReactNode } from 'react';
import { ButtonProps } from '@mui/material/Button';

import { StyledButton } from './containedButton.styles';

interface IProps extends ButtonProps {
	children: ReactNode;
	icon?: any;
	onClick?: (e) => void;
}

export const ContainedButton: FC<IProps> = ({ children, icon, onClick, ...props }) => {
	const IconComponent = icon;
	return (
		<StyledButton
			color="primary"
			variant="contained"
			size="small"
			squeezed={icon ? 1 : 0}
			onClick={onClick}
			{...props}
		>
			{icon && <IconComponent />}
			{children}
		</StyledButton>
	);
};
