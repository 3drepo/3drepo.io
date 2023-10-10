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
import { primaryButtonStyling } from '@/v5/ui/v4Adapter/resuableOverrides.styles';
import { Footer as InvitationsListFooter } from '@/v4/routes/components/invitationsDialog/invitationsDialog.styles';
import { Footer as NewInviteFooter } from '@/v4/routes/components/invitationDialog/invitationDialog.styles';

const titleStyling = css`
	.MuiDialog-paper:has(> .MuiDialogContent-root > .MuiTabs-root) ${DialogTitle} {
		background-color: ${({ theme }) => theme.palette.primary.contrast};
	}

	${DialogTitle} {
		height: fit-content;
		width: 100%;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		padding: 16px 30px 11px;
		color: ${({ theme }) => theme.palette.secondary.main};
		background-color: ${({ theme }) => theme.palette.tertiary.lightest};

		button {
			display: grid;
			place-content: center;

			position: absolute;
			top: 16px;
			right: 14px;
			padding: 0;
			margin: 0;
			height: 32px;
			width: 32px;
			border: none;
			border-radius: 8px;
			background: white;
			box-sizing: border-box;

			svg {
				width: 12px;
				height: 12px;

				path {
					stroke: ${({ theme }) => theme.palette.secondary.main};
					fill: ${({ theme }) => theme.palette.secondary.main};
				}
			}
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
		z-index: 0;
		padding: 8px;
		background-color: ${({ theme }) => theme.palette.tertiary.lighter};

		.MuiButtonBase-root.MuiButtonBase-root:last-child {
			line-height: 1;
			&:not(:disabled) {
				${primaryButtonStyling}
			}

			&, &:hover, &:active {
				border: 0;
			}
		}
	}
`;

export default css`
	${titleStyling}
	${contentStyling}
	${buttonContainerStyling}
`;
