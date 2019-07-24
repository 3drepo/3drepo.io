/**
 *  Copyright (C) 2019 3D Repo Ltd
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

import Star from '@material-ui/icons/Star';
import StarBorder from '@material-ui/icons/StarBorder';

import { IconWrapper } from './starIcon.styles';

interface IProps {
	active: number;
	activeColor: string;
	onClick: () => void;
}

export function StarIcon({ active, activeColor, onClick }: IProps) {
	const IconComponent = active ? Star : StarBorder;

	return (
		<IconWrapper active={active} theme={{activeColor}}>
			<IconComponent onClick={onClick} color="inherit" fontSize="small" />
		</IconWrapper>
	);
}