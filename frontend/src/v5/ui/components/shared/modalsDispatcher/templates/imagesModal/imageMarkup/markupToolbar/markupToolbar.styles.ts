/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { ViewerIconContainer } from '@assets/icons/viewer/viewerIconContainer.styles';
import { Button } from '@controls/button';
import styled from 'styled-components';

export const Toolbar = styled.div`
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	color: ${({ theme }) => theme.palette.secondary.main};
	width: fit-content;
	height: 47px;
	box-sizing: border-box;
	padding: 4px;
	display: flex;
	flex-direction: row;
	align-items: center;
	border-radius: 24px;
	pointer-events: all;
	box-shadow: 0 2px 7px 0 #00000026;

	& > ${ViewerIconContainer} {
		border-radius: 24px;
		padding: 0 10px;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-evenly;
	}
`;

export const Divider = styled.div`
	width: 1px;
	height: 30px;
	margin: 0 5px;
	background-color: ${({ theme }) => theme.palette.base.main};
`;

export const SaveButton = styled(Button).attrs({
	variant: 'contained',
	color: 'primary',
})`
	height: 40px;
	width: 40px;
	border-radius: 50%;
	min-width: unset;
	padding: 0;
	margin: unset;
`;
