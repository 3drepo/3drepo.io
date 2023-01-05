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

import {
	DialogTab,
	DialogTabs,
	NegativeActionButton as ResetButton,
	NeutralActionButton as CancelButton,
	VisualSettingsButtonsContainer as Actions,
	VisualSettingsDialogContent,
} from '@/v4/routes/components/topMenu/components/visualSettingsDialog/visualSettingsDialog.styles';
import styled from 'styled-components';

export const V5VisualSettingsOverrides = styled.div`
	background-color: ${({ theme }) => theme.palette.tertiary.lightest};
	width: 400px;
	overflow: hidden;
	${VisualSettingsDialogContent} {
		padding: 0;
		margin: 0;
		overflow: hidden;
		height: unset;
		${DialogTabs} {
			background-color: ${({ theme }) => theme.palette.primary.contrast};
			padding: 0 27px;
			box-sizing: border-box;
			z-index: 1;
			width: inherit;
			${DialogTab} {
				min-height: unset;
				min-width: unset;
				max-width: unset;
    			flex-grow: 0;
				margin: 0;
				padding: 10px;
				height: 48px;
				font-size: 13px;
			}
		}

		form {
			margin-bottom: 65px;
			padding: 23px 30px;
			overflow-y: auto;
			height: 40vh;
			box-sizing: border-box;
			.MuiList-root {
				box-shadow: none;
				padding: 0;
				.MuiListItem-root {
					padding: 0;
					color: ${({ theme }) => theme.palette.base.main};
					.MuiInputBase-root {
						width: 130px;
					}
				}
			}
			${Actions} {
				background-color: ${({ theme }) => theme.palette.tertiary.lightest};
				box-shadow: ${({ theme }) => theme.palette.shadows.level_7};
				height: 65px;
				bottom: 0;
				justify-content: left;
				align-items: center;
				padding: 0 7px;
				box-sizing: border-box;
				.MuiButtonBase-root {
					margin: 5px;
				}
				${ResetButton} {
					background-color: transparent;
					color: ${({ theme }) => theme.palette.secondary.main};
					margin-right: auto;
					:hover {
						text-decoration: underline;
					}
				}
				${CancelButton} {
					border: 1px solid ${({ theme }) => theme.palette.secondary.main};
					color: ${({ theme }) => theme.palette.secondary.main};
					:hover {
						background-color: ${({ theme }) => theme.palette.secondary.main};
						color: ${({ theme }) => theme.palette.primary.contrast};
					}
				}
				.MuiButtonBase-root:last-of-type {
					color: ${({ theme }) => theme.palette.primary.contrast};
					background-color: ${({ theme }) => theme.palette.primary.main};
					:hover {
						background-color: ${({ theme }) => theme.palette.primary.dark};
					}
					&.Mui-disabled {
						background-color: ${({ theme }) => theme.palette.base.lightest};
					}
				}
			}
		}
	}
`;
