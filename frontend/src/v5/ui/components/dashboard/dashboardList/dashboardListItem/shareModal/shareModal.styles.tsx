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
import React from 'react';
import styled from 'styled-components';
import { TextField } from '@material-ui/core';
import Tooltip, { TooltipProps } from '@material-ui/core/Tooltip';
import CopyToClipboard from '@assets/icons/copy_to_clipboard';
import tick from '@assets/icons/tick';

export const Container = styled.div`
	display: flex;
	flex-grow: 1;
	flex-direction: column;
	justify-content: center;
`;

export const LinkLabel = styled.span`
	${({ theme }) => theme.typography.kicker};
	color: ${({ theme }) => theme.palette.base.main};
	font-family: ${({ theme }) => theme.typography.fontFamily};
`;

export const LinkContainer = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	width: 100%;
	max-width: 100%;
	padding: 10px 15px;
	border-radius: 5px;
	border: 1px solid ${({ theme }) => theme.palette.base.lightest};
	box-sizing: border-box;
	
	:hover {
		cursor: pointer;
	}
`;
export const Link = styled.span`
	${({ theme }) => theme.typography.body1};
	color: ${({ theme }) => theme.palette.base.main};
	font-family: ${({ theme }) => theme.typography.fontFamily};
	display: flex;
	align-items: center;
`;

export const MailToButton = styled.a`
	${({ theme }) => theme.typography.link};
	color: ${({ theme }) => theme.palette.base.main};
	font-family: ${({ theme }) => theme.typography.fontFamily};
	margin-top: 20px;
	width: fit-content;
`;

export const Tick = styled(tick)``;

type CopyToClipboardTooltipProps = TooltipProps & {
	isCopiable: boolean;
	theme: any
};

export const CopyToClipboardTooltip = styled(
	({ className, theme, isCopiable, ...props }: CopyToClipboardTooltipProps) => (
		<Tooltip {...props} classes={{ popper: className }} />
	),
)`
	${({ theme, isCopiable }) => !isCopiable && (
		`& .MuiTooltip-tooltip {
			background-color: ${theme.palette.primary.main};
		}`
	)};
`;

export const CopyToClipboardIconContainer = styled.div`
	display: grid;
`;

export const UrlContainer = styled(TextField)`
	margin: 6px 0 0 0;

	.MuiInputBase-root {
		cursor: pointer;
		margin-top: 0;

		&:hover .MuiOutlinedInput-notchedOutline {
			border-color: ${({ theme }) => theme.palette.base.lightest};
		} 

		&.Mui-focused {
			input {
				color: ${({ theme }) => theme.palette.base.main};
			}
			
			.MuiOutlinedInput-notchedOutline {
				border-color: ${({ theme }) => theme.palette.base.lightest};
			}
		}

		.MuiOutlinedInput-input {
			cursor: pointer;
	
			&:active {
				color: ${({ theme }) => theme.palette.base.main};
			}
		}
	}

	/* &:hover ${CopyToClipboardIcon} {
		fill: ${({ theme }) => theme.palette.primary.main};
	} */
`;

export const CopyToClipboardIcon = styled(({ className }) => (
	<CopyToClipboard className={className} />
))`
	&& {
		${UrlContainer}:hover {
			fill: ${({ theme }) => theme.palette.primary.main};;
		}
	}
`;
