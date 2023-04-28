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

import styled from 'styled-components';
import Checkers from '@assets/images/checkers.svg';
import { ComponentToString } from '@/v5/helpers/react.helper';
import { TextField } from '@mui/material';
import { NumberField } from '@controls/inputs/numberField/numberField.component';
import { ActionMenu } from '@controls/actionMenu';
import { ColorCircle } from '../colorCircle/colorCircle.styles';

export const ColorGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(6, 1fr);
	grid-template-rows: repeat(4, 1fr);
	width: 230px;
	height: 152px;
	grid-gap: 20px;
	margin-bottom: 10px;
`;

export const ColorActionMenu = styled(ActionMenu).attrs({
	PopoverProps: {
		anchorOrigin: {
			vertical: 'bottom',
			horizontal: 'right',
		},
		transformOrigin: {
			vertical: 'bottom',
			horizontal: 'left',
		},
		sx: {
			margin: '26px 0 0 20px',
		},
	},
})``;

export const ColorOption = styled(ColorCircle).attrs({
	$size: 18,
})``;

export const BottomBar = styled.div`
	display: flex;
	flex-direction: row;
	align-items: flex-end;
	justify-content: space-between;
	width: 100%;
`;

export const SquaredColorOption = styled.div<{ $color: string, $opacity: number }>`
	border-radius: 5px;
	height: 24px;
	width: 24px;
	background: url('data:image/svg+xml;utf8,${ComponentToString(Checkers)}');

	&::before {
		content: '';
		background: ${({ $color }) => $color};
		opacity: ${({ $opacity }) => $opacity};
		position: absolute;
		border-radius: 5px;
		width: 24px;
		height: 24px;
	}
`;

export const HexTextField = styled(TextField).attrs({
	inputProps: {
		maxlength: '6',
	},
})`
	width: 82px;

	.MuiInputBase-root::before {
		content: '#';
		padding-left: 10px;
	}

	input {
		padding-left: 0;
	}
`;

export const PercentageTextField = styled(NumberField).attrs({
	inputProps: {
		type: 'number',
	},
})`
	width: 54px;

	label {
		overflow: visible;
	}

	.MuiInputBase-root::after {
		content: '%';
		padding-right: 13px;
	}

	input {
		padding: 0;
		text-align: end;
	}
`;

export const GradientButton = styled.div`
	cursor: pointer;
	background: conic-gradient(#0047FF, #DB00FF, #FF0000, #FFE600, #14FF00, #0047FF);
	height: 31px;
	width: 31px;
	border-radius: 31px;
`;
