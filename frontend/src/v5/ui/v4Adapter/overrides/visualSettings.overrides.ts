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
	ErrorTooltip,
	Headline as StreamingHeadline,
	NegativeActionButton as ResetButton,
	NeutralActionButton as CancelButton,
	V5ErrorText,
	VisualSettingsButtonsContainer as Actions,
	VisualSettingsDialogContent,
	WarningMessage,
} from '@/v4/routes/components/topMenu/components/visualSettingsDialog/visualSettingsDialog.styles';
import { VisualSettingsModalContent } from '@components/shared/userMenu/visualSettingsModal/visualSettingsModal.styles';
import { css } from 'styled-components';

const sharedInputStyles = css`
	.MuiInputBase-root, .MuiGrid-container {
		border: 1px solid ${({ theme }) => theme.palette.base.lightest};
		border-radius: 8px;
		box-sizing: content-box;
		background-color: ${({ theme }) => theme.palette.primary.contrast};
		height: 24px;
		width: 130px;
		padding: 0 12px;
		&.Mui-focused {
			box-shadow: 0 0 2px ${({ theme }) => theme.palette.primary.main};
			border-color: ${({ theme }) => theme.palette.primary.main};
		}
		&.Mui-error {
			border-color: ${({ theme }) => theme.palette.error.main};
			&.Mui-focused {
				box-shadow: 0 0 2px ${({ theme }) => theme.palette.error.main};
			}
			.MuiInputAdornment-root {
				color: ${({ theme }) => theme.palette.error.light};
			}
		}
	}
	.MuiGrid-container {
		width: 50px;
		box-sizing: border-box;
		.MuiGrid-root:first-of-type {
			height: 10px;
			width: 10px;
		}
		.MuiGrid-root:last-of-type {
			position: absolute;
			right: 0
		}
	}
`;
const selectStyles = css`
	.MuiSelect-select {
		background-color: transparent;
		padding: 0;
		border: none;
		box-shadow: none;
	}
	.MuiOutlinedInput-notchedOutline {
		border: none;
		height: inherit;
	}
`;
const textInputStyles = css`
	.shortInput {
		width: auto;
		text-align: left;
		color: ${({ theme }) => theme.palette.secondary.main};
	}
	.MuiInputAdornment-root {
		margin: 0 4px;
		color: ${({ theme }) => theme.palette.base.main};
	}
	${V5ErrorText} {
		top: 21px;
		width: 156px;
		margin: 2px 0;
		display: block;
		color: ${({ theme }) => theme.palette.error.main};
	}
`;

export default css`
	${ErrorTooltip} {
		.tooltip {
			display: none;
		}
	}
	${VisualSettingsModalContent} {
		${VisualSettingsDialogContent} {
			padding: 0;
			margin: 0;
			overflow: hidden;
			height: unset;
			background-color: ${({ theme }) => theme.palette.tertiary.lightest};
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
					padding: 0;
					margin: 10px;
					height: 28px;
					font-size: 13px;
				}
			}
	
			form {
				margin-bottom: 65px;
				overflow-y: auto;
				height: 415px;
				box-sizing: border-box;
				.MuiList-root {
					box-shadow: none;
					padding: 17px 30px;
					.MuiListItem-root {
						min-height: 38px;
						height: auto;
						padding: 0;
						color: ${({ theme }) => theme.palette.base.main};
						${sharedInputStyles}
						${selectStyles}
						${textInputStyles}
						${WarningMessage} {
							color: ${({ theme }) => theme.palette.warning.main};
							margin-top: 25px;
						}
					}
					${StreamingHeadline} {
						${({ theme }) => theme.typography.h5};
						color: ${({ theme }) => theme.palette.secondary.main};
						height: 38px;
						display: flex;
						align-items: center;
						white-space: nowrap;
						&::after { /* divider after headline */
							content: '';
							border: 1px solid ${({ theme }) => theme.palette.base.lightest};
							height: 0;
							width: 100%;
							border-top: none;
							box-sizing: border-box;
							margin-left: 12px;
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
						&.Mui-disabled {
							visibility: hidden;
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
	}
`;
