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
import { createElement } from 'react';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import Popover from '@mui/material/Popover';
import Slider from '@mui/material/Slider';
import styled, { css } from 'styled-components';

import { COLOR, FONT_WEIGHT } from '../../../styles';
import { CheckboxField } from '../customTable/customTable.component';

export const ColorSelect = styled(Grid)<{ disabled: boolean }>`
	cursor: ${({ disabled }) => disabled ? 'default' : 'pointer'};
	border-bottom: 1px solid rgba(0, 0, 0, .12);

	&& {
		width: 49px;
	}
` as any;

export const Dot = styled(Grid)<{ color: string }>`
	width: 16px;
	height: 16px;
	border-radius: 100%;
	background-color: ${({ color }) => color || 'transparent'};
	border: 2px dotted ${({ color }) => color ? 'transparent' : 'rgba(0, 0, 0, .38)'};
`;

export const Panel = styled(Popover).attrs({
	classes: {
		paper: 'color-picker__panel'
	}
})`
	.color-picker__panel {
		width: 228px;
		padding: 16px;
	}
`;

export const StyledIconButton = styled(IconButton)`
	&& {
		width: 28px;
		height: 28px;
		margin-left: 5px;
		padding: 0;

		${({ disabled }) => disabled && css`
			visibility: hidden;
		`}
	}
`;

export const CanvasContainer = styled(Grid)`
	position: relative;
`;

export const Canvas = styled.canvas`
	cursor: crosshair;
	height: 170px;
	padding-bottom: 14px;
`;

export const BlockCanvas = styled(Canvas)``;
export const StripCanvas = styled(Canvas) ``;

export const PredefinedColorsContainer = styled(Grid)`
	padding-bottom: 14px;
`;

export const PredefinedColor = styled(Grid)<{ color: string }>`
	border-radius: 100%;
	width: 20px;
	height: 20px;
	cursor: pointer;
	outline: none;
	transition: box-shadow 200ms ease-in-out;
	background-color: ${({ color }) => color};
	margin-right: 0.9rem !important;

	&:hover {
		box-shadow: inset 0 0 10px rgba(0, 0, 0, .5)
	}

	&:last-child {
		margin-right: 0 !important;
	}
`;

export const ColorPointer = styled.div`
	position: absolute;
	pointer-events: none;
	width: 6px;
	height: 6px;
	border: 1px solid ${COLOR.WHITE};
	border-radius: 100%;
	content: '';
	transform: translate(-3px, -6px);
`;

export const SelectedColor = styled(({ color, ...rest}) =>
	createElement('div', {...rest, style : {backgroundColor: color} }))`
	width: 55px;
	height: 20px;
	border: ${(props) => props.color && props.color !== COLOR.WHITE ? 0 : 1 }px solid ${COLOR.BLACK_6};
`;

// eslint-disable-next-line max-len
export const SelectedColorBackground = styled.div` background-image:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect x="0" width="5" height="5" y="0" fill="rgb(158, 158, 158)"/><rect x="5" width="5" height="5" y="5" fill="rgb(158, 158, 158)"/></svg>');
	width: 55px;
	height: 20px;
	margin-bottom: -20px;
`;

export const OpacityVisibilityCheckbox = styled(CheckboxField)`
	&& {
		margin-left: -15px;
	}
`;

export const OpacitySlider = styled(Slider)`
	&& {
		width: 165px;
		padding-right: 9px;
	}
`;

export const OpacityValue = styled.div`
	font-size: 14px;
`;

export const StyledAdornment = styled(InputAdornment)`
	&& {
		max-height: 3em;
		margin-right: 3px;
	}
`;

export const SelectedHash = styled(({withOpacity, ...rest}) => createElement(Input, rest))`
	&& {
		margin-left: 25px;
		font-weight: ${FONT_WEIGHT.NORMAL};
		width: ${(props) => props.withOpacity ? '90' : '70'}px;
	}

	input {
		width: 70px;
		height: 20px;
		color: #333333;
		font-size: 14px;
		margin-left: 2px;
		outline: none;
	}
`;

export const OpacityInput = styled(Input)`
	&& {
		font-weight: ${FONT_WEIGHT.NORMAL};
		width: 52px;
	}

	input {
		width: 52px;
		height: 20px;
		color: #333333;
		font-size: 14px;
		margin-left: 2px;
		outline: none;
	}
`;

export const OpacityInputAdornment = styled(StyledAdornment)`
	&& {
		margin-left: -24px;
		margin-bottom: 4px;
	}
`;

export const StyledButton = styled(Button)`
	&& {
		margin-right: 8px;
	}
`;

export const Footer = styled.div`
	border-top: 1px solid #efefef;
	margin-top: 16px;
	min-width: calc(100% + 32px);
	margin-left: -16px;
	margin-bottom: -16px;
	padding: 12px 16px;
`;
