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

import { Button, Divider, IconButton as IconButtonComponent } from '@material-ui/core';
import IconBadge from '@material-ui/core/Badge';
import styled from 'styled-components';
import { COLOR } from '../../../../../styles';
import * as ColorPickerStyles from '../../../../components/colorPicker/colorPicker.styles';

export const StyledButton = styled(Button)`
	&& {
		padding: 8px;
	}

	&:last-child {
		margin-left: 8px;
	}
`;

export const ToolsContainer = styled.div`
	position: absolute;
	z-index: 3;
	bottom: 35px;
	left: 50%;
	transform: translate(-50%, 0);
	display: ${(props: any) => props.disabled ? 'none' : 'flex'};
	align-items: center;
	background: ${COLOR.WHITE_87};
	padding: 5px 10px 5px 20px;
	box-shadow: 0 0 10px ${COLOR.BLACK_20};
	border-radius: 4px;
	transition: opacity 200ms ease-in-out;

	${ColorPickerStyles.ColorSelect} {
		border-bottom: none;
		width: 60px;
	}

	&[disabled] {
		padding-left: 10px;

		${StyledButton} {
			margin-left: 0;
		}
	}
` as any;

export const OptionsDivider = styled(Divider)`
	&& {
		margin: 0 12px;
		height: 48px;
		width: 1px;
		opacity: 0.5;
	}
`;

export const IconButton = styled(IconButtonComponent)`
	background: ${COLOR.BLACK_60};
	opacity: 1;
	svg .stroke {
		stroke: currentColor;
	}
`;

export const ShapeMenuButton = styled.div`
	margin-left: -10px;
`;

export const Badge = styled(IconBadge)`
	&& {
		height: 24px;
		width: 24px;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	&& span {
		background-color: transparent;
		color: ${COLOR.BLACK_60};
		bottom: -9px;
		right: -10px;
		top: auto;
		font-size: 0.5rem;
		font-weight: bold;
	}
`;
