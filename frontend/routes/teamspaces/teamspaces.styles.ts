/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import Button from '@material-ui/core/Button';
import styled from 'styled-components';
import { COLOR } from '../../styles';

export const Head = styled.div`
	font-size: 14px;
	color: ${COLOR.BLACK_60};
	min-height: 50px;
	display: flex;
	align-items: center;
	justify-content: flex-start;
	background: ${COLOR.WHITE};
	padding-left: 24px;
	border-bottom: 1px solid ${COLOR.BLACK_6};
	position: relative;
	z-index: 1;
`;

export const List = styled.div`
	overflow: auto;
	position: relative;
`;

export const LoaderContainer = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: flex-start;
	padding-top: 100px;
	box-sizing: border-box;
`;

export const MenuButton = styled(Button).attrs({
	classes: {
		disabled: 'button--disabled'
	}
})`
	&&.button--disabled {
		background: #d9d9d9;
		color: #868686;
	}

	&& {
		position: absolute;
		bottom: -22px;
		right: 14px;
	}
`;

export const MyTeamspace = styled.div`

`;
