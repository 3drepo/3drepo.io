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
import { TitleIcon, ViewerPanelFooter } from '@/v4/routes/viewerGui/components/viewerPanel/viewerPanel.styles';
import { Title, Container as ViewerPanelBody } from '@/v4/routes/components/panel/panel.styles';
import { Container as ViewerPanelEmptySpace } from '@/v4/routes/viewerGui/components/previewDetails/previewDetails.styles';
import {
	ButtonContainer,
	Container as FilterPanelContainer,
	FiltersButton,
	Placeholder,
	PlaceholderText,
} from '@/v4/routes/components/filterPanel/filterPanel.styles';
import { StyledIconButton } from '@/v4/routes/teamspaces/components/tooltipButton/tooltipButton.styles';
import { Container } from '@/v4/routes/viewerGui/viewerGui.styles';

export default css`
	${Container} {
		${Title} {
			color: ${({ theme }) => theme.palette.secondary.main};
			background-color: ${({ theme }) => theme.palette.primary.contrast};
			${({ theme }) => theme.typography.h3};
			border-bottom: 1px solid ${({ theme }) => theme.palette.base.lightest};
			height: 49px;
			font-size: 17px;

			.panelTitle { 
				margin: 0 0 0 -16px;
				width: calc(100% + 16px);
			}

			// back arrow icon
			${TitleIcon} {
				svg {
					font-size: 1.4rem;
				}
				
				.MuiIconButton-root {
					background: transparent;
					color: ${({ theme }) => theme.palette.primary.main};
					border-radius: 0;
					margin: 0;
				}
			}

			// action icons
			.MuiIconButton-root {
				background-color: #edf0f8; // TODO - fix after new palette is released
				color: currentColor;
				border-radius: 50%;
				height: 32px;
				width: 32px;
				margin: 0 0 0 5px;

				&.Mui-disabled {
					color: ${({ theme }) => theme.palette.base.lightest};
				}

				svg {
					font-size: 1.2rem;
				}

				&[hidden] {
					display: none;
				}
			}
		}
		
		// Filter components
		${FiltersButton} {
			top: 13px;
		}

		${FilterPanelContainer} {
			.Mui-focused .MuiOutlinedInput-notchedOutline, .MuiOutlinedInput-notchedOutline {
				box-sizing: border-box;
				box-shadow: none;
				border: 0;
				border-bottom: 1px solid ${({ theme }) => theme.palette.base.lightest};
				height: 49px;
				font-size: 17px;

				.panelTitle {
					margin: 0 0 0 -16px;
					width: calc(100% + 16px);
				}

				// back arrow icon
				${TitleIcon} {
					width: 30px;
					padding-left: 8px;

					svg {
						font-size: 1.4rem;
					}

					.MuiIconButton-root {
						background: transparent;
						color: ${({ theme }) => theme.palette.primary.main};
						border-radius: 0;
						margin: 0;
					}
				}

				// action icons
				.MuiIconButton-root {
					background-color: #edf0f8; // TODO - fix after new palette is released
					color: currentColor;
					border-radius: 50%;
					height: 32px;
					width: 32px;
					margin: 0 0 0 5px;

					&.Mui-disabled {
						color: ${({ theme }) => theme.palette.base.lightest};
					}

					svg {
						font-size: 1.2rem;
					}

					&[hidden] {
						display: none;
					}
				}
			}
		}

		// Filter components
		${FiltersButton} {
			top: 13px;
		}

		${FilterPanelContainer} {
			.Mui-focused .MuiOutlinedInput-notchedOutline, .MuiOutlinedInput-notchedOutline {
				box-sizing: border-box;
				box-shadow: none;
				border: 0;
				border-bottom: 1px solid ${({ theme }) => theme.palette.base.lightest};
				border-radius: 0;
			}

			${Placeholder} {
				.MuiSvgIcon-root {
					height: 0.8em;
					color: ${({ theme }) => theme.palette.secondary.main};
				}

				${PlaceholderText} {
					font-size: 13px;
					color: ${({ theme }) => theme.palette.base.main};
				}
			}

			${ButtonContainer} {
				color: ${({ theme }) => theme.palette.base.main};
			}

			.MuiButtonBase-root {
				margin: 0;
			}

			.MuiChip-root {
				margin: 3px 4px 3px 0;
			}
		}

		${ViewerPanelBody}, ${ViewerPanelEmptySpace} {
			background-color: ${({ theme }) => theme.palette.primary.contrast};
			border-radius: 10px;
		}

		${ViewerPanelFooter} {
			min-height: 48px;
			${({ theme }) => theme.typography.caption};
			color: ${({ theme }) => theme.palette.base.light} !important;
			box-sizing: border-box;
			border-color: ${({ theme }) => theme.palette.base.lightest};
			z-index: 0;

			${StyledIconButton} {
				height: 26px;
			}

			.Mui-focused .MuiInputBase-input {
				border: 0;
				box-shadow: none;
			}

			button {
				background-color: ${({ theme }) => theme.palette.primary.main};
				margin: 0 -3px 0 0;
				width: 36px;
				height: 32px;

				&:hover {
					background-color: ${({ theme }) => theme.palette.primary.dark};
				}
				&:active {
					box-shadow: none;
					background-color: ${({ theme }) => theme.palette.primary.darkest};
				}
				&:disabled {
					background-color: #edf0f8; // TODO - fix after new palette is released
				}
			}
		}
	}
`;
