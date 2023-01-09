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
import styled from 'styled-components';
import { TextField } from '@mui/material';
import Tooltip, { TooltipProps } from '@mui/material/Tooltip';
import copyToClipboardIcon from '@assets/icons/outlined/copy_to_clipboard-outlined.svg';
import tick from '@assets/icons/outlined/tick-outlined.svg';

const SVG_PADDING_IN_PX = 9;

export const CopyToClipboardIcon = styled(copyToClipboardIcon)`
	padding: ${SVG_PADDING_IN_PX}px;
`;

export const Tick = styled(tick)`
	padding: ${SVG_PADDING_IN_PX}px;
	padding-left: ${SVG_PADDING_IN_PX - 2}px;
	padding-right: ${SVG_PADDING_IN_PX + 2}px;
`;

export const CopyToClipboardIconContainer = styled.div`
	display: grid;
`;

export const LinkBar = styled(TextField)`
	.MuiInputBase-root {
		${({ disabled }) => !disabled && `
			cursor: pointer;
		`}
		margin-top: 0;
		padding-right: ${9 - SVG_PADDING_IN_PX}px;


		.MuiOutlinedInput-input {
			pointer-events: none;
			user-select: none;
			padding-right: ${9 - SVG_PADDING_IN_PX}px;
		}
	}

	.MuiInputAdornment-positionEnd {
		margin-left: 0;
	}

	&:hover ${CopyToClipboardIcon} {
		fill: ${({ theme }) => theme.palette.primary.main};
	}
`;

export const CopyToClipboardTooltip = styled(
	({ className, theme, ...props }: TooltipProps & { theme: any }) => (
		<Tooltip
			{...props}
			PopperProps={{ keepMounted: true }}
			classes={{ popper: className }}
		>
			{props.children}
		</Tooltip>
	),
)``;

export const CopiedToClipboardTooltip = styled(CopyToClipboardTooltip)`
	& .MuiTooltip-tooltip {
		background-color: ${({ theme }) => theme.palette.primary.main};
	}
`;
