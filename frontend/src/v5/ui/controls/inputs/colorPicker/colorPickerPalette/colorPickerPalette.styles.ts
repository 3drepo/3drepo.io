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

import styled, { css } from 'styled-components';
import Checkers from '@assets/images/checkers.svg';
import { ComponentToString } from '@/v5/helpers/react.helper';
import { TextField } from '@mui/material';
import { NumberField } from '@controls/inputs/numberField/numberField.component';
import { ActionMenu } from '@controls/actionMenu';
import { Button } from '@controls/button';
import { ColorCircle } from '../colorCircle/colorCircle.styles';

export const ColorGrid = styled.div`
	display: grid;
	place-items: center;
	grid-template-columns: repeat(6, 1fr);
	grid-gap: 20px;
	width: 210px;
	height: 152px;
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
			margin: '71px 0 0 20px',
		},
	},
})``;

export const ColorOption = styled(ColorCircle).attrs({
	$size: 18,
})`
	cursor: pointer;
`;

export const BottomBar = styled.div`
	display: flex;
	flex-direction: row;
	align-items: flex-end;
	justify-content: space-between;
	width: 100%;
`;

export const UpdateButton = styled(Button).attrs({
	color: 'primary',
	variant: 'contained',
	fullWidth: true,
})`
	height: 28px;
	margin: 18px 0 0 auto;
`;

export const SquaredColorOption = styled(ColorCircle).attrs({
	$size: 26,
})<{ $opacity: number }>`
	border-radius: 5px;
	overflow: hidden;
	position: relative;

	${({ $color, $opacity = 1, theme }) => $color && css`
		&::before {
			content: '';
			background: url('data:image/svg+xml;utf8,${ComponentToString(Checkers)}');
			background-color: ${theme.palette.primary.contrast};
			opacity: ${1 - $opacity};
			position: absolute;
			border-radius: 0 5px 5px 0;
			margin-left: 13px;
			width: 13px;
			height: 26px;
		}
	`};
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

	&& input {
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

	&& input {
		padding: 0;
		text-align: end;
	}
`;

export const GradientButton = styled.div`
	cursor: pointer;
	background: conic-gradient(#0047FF, #DB00FF, #FF0000, #FFE600, #14FF00, #0047FF);
	height: 26px;
	width: 26px;
	border-radius: 26px;
`;
