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
import { css } from 'styled-components';
import { DialogTitle } from '@/v4/routes/components/dialogContainer/components/dialog/dialog.styles';
import { labelButtonPrimaryStyles } from '@controls/button/button.styles';
import { Footer as InvitationsListFooter } from '@/v4/routes/components/invitationsDialog/invitationsDialog.styles';
import { Footer as NewInviteFooter } from '@/v4/routes/components/invitationDialog/invitationDialog.styles';

const titleStyling = css`
	${DialogTitle} {
		background: ${({ theme }) => theme.palette.gradient.secondary};
		color: ${({ theme }) => theme.palette.primary.contrast};
		height: 74px;
		width: 100%;
		box-sizing: border-box;
		align-items: center;
		display: flex;
		padding: 0 35px;

		button {
			position: absolute;
			top: 10px;
			right: 10px;
			width: 40px;
			height: 40px;
		}

		.MuiDialogContent-root {
			padding: 0;
		}
	}
`;

const contentStyling = css`
	.MuiDialogContent-root {
		overflow-x: hidden;
		max-width: 600px;
		padding: 30px;
		background-color: ${({ theme }) => theme.palette.tertiary.lightest};
		color: ${({ theme }) => theme.palette.secondary.main};
		${({ theme }) => theme.typography.body1}

		code {
			font-family: ${({ theme }) => theme.typography.fontFamily};
			font-weight: 500;
		}
	}
`;

const buttonContainerStyling = css`
	.MuiDialogActions-root, ${InvitationsListFooter}, ${NewInviteFooter} {
		box-shadow: ${({ theme }) => theme.palette.shadows.level_7};
		z-index: 0;
		padding: 8px;
		background-color: ${({ theme }) => theme.palette.tertiary.lightest};

		.MuiButtonBase-root.MuiButtonBase-root:last-child {
			${labelButtonPrimaryStyles}
			line-height: 1;

			&, &:hover, &:active {
				border: 0;
			}
		}
	}
`;

export const secondaryButtonStyling = css`
	border: 1px solid ${({ theme }) => theme.palette.secondary.main};
	color: ${({ theme }) => theme.palette.secondary.main};
	line-height: 1;
	:hover {
		background-color: ${({ theme }) => theme.palette.secondary.main};
		color: ${({ theme }) => theme.palette.primary.contrast};
		text-decoration: none;
	}
`;

export default css`
	${titleStyling}
	${contentStyling}
	${buttonContainerStyling}
`;
