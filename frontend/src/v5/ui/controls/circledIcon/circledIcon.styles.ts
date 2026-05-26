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

import styled, { css } from 'styled-components';

const SIZE_MAP = {
	small: 54,
	medium: 74,
	large: 94,
};

const COLOUR_MAP = {
	main: ({ theme }) => theme.palette.primary.main,
	contrast: ({ theme }) => theme.palette.secondary.main,
	error: ({ theme }) => theme.palette.error.main,
};

const getIconSize = (size: string) => {
	const iconSize = SIZE_MAP[size];
	if (iconSize) {
		return css`
			height: ${iconSize}px;
			width: ${iconSize}px;
			
		`;
	}

	return null;
};

const getIconColour = (variant: string) => {
	const iconColour = COLOUR_MAP[variant];
	if (iconColour) {
		return css`
			border-color: ${iconColour};
			color: ${iconColour};
		`;
	}

	return null;
};

export const Container = styled.div<{ size: string; variant: string; }>`
	${({ size }) => getIconSize(size)};
	${({ variant }) => getIconColour(variant)}
	display: flex;
	align-items: center;
	justify-content: center;

	> * {
		height: 33%;
		width: auto;
		overflow: visible;
	}

	border: 2px solid;
	border-radius: 50%;
`;
