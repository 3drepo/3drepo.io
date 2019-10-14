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

import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import styled from 'styled-components';
import { COLOR } from '../../styles';

export const Container = styled.div`
	height: 100%;
	width: 100%;

	.react-trello-board {
		background-color: initial;
		height: auto;
    padding: 0;
	}
`;

export const BoardContainer = styled.div`
	padding: 15px;
`;

export const Config = styled.div`
	background-color: ${COLOR.BLACK_12};
`;

export const TitleActions = styled.div`
	display: flex;
`;

export const StyledItem = styled(MenuItem)``;

export const StyledSelect = styled(Select)``;

export const TitleContainer = styled.div`
	align-items: center;
	color: ${COLOR.WHITE_87};
	display: flex;
	justify-content: space-between;
	width: 100%;

	${StyledSelect} {
		div {
			color: ${COLOR.WHITE_87};
			font-size: 20px;
			display: flex;
			align-items: center;
		}

		svg {
			color: ${COLOR.WHITE_87};
		}
	}
`;

export const SelectContainer = styled.div`

`;
