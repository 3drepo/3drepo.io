/**
 *  Copyright (C) 2022 3D Repo Ltd
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
import CrossIcon from '@assets/icons/outlined/close-outlined.svg';
import { isLight } from '@/v5/helpers/colors.helper';

const filledStyles = (color: string) => css`
	color: ${({ theme }) => isLight(color) ? '#20232A' : theme.palette.primary.contrast};
	background-color: ${color};
	border-color: ${color};
`;

const outlinedStyles = (color: string) => css`
	color: ${color};
	border: 1px solid currentColor;
	background: transparent;
`;

const textStyles = (color: string) => css`
	border-color: transparent;
	background-color: transparent;
	color: ${color};
	&:hover {
		text-decoration: underline;
		filter: brightness(75%);
	}
`;

export const ChipWrapper = styled.div<{ variant: string; color: string; disabled: boolean }>`
	display: inline-flex;
	max-width: 100%;
	pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};
	.MuiChip-root {
		font-size: 8px;
		text-transform: uppercase;
		padding: 3px 7px;
		border-width: 1px;
		border-radius: 25px;
		height: 20px;
		gap: 4px;
		user-select: none;
		cursor: pointer;
		margin: 0;
		letter-spacing: 0.3px;
		svg {
			height: 10px;
			width: 10px;
			min-width: 10px;
			color: currentColor;
			&.MuiChip-icon {
				color: inherit;
				margin: 0;
			}
		}
		.MuiChip-deleteIcon {
			display: contents;
			&:hover {
				color: inherit;
			}
			svg {
				height: 8px;
				min-width: 8px;
				margin-right: 2px;
			}
		}
		.MuiChip-label {
			padding: 0;
			line-height: normal;
		}
		${({ variant, color }) => {
		switch (variant) {
			case 'text':
				return textStyles(color);
			case 'filled':
				return filledStyles(color);
			default: // outlined
				return outlinedStyles(color);
		}
	}}
	}
`;

export const PaddedCrossIcon = styled(CrossIcon)`
	box-sizing: border-box;
	padding: 1px;
`;
