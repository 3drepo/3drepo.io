/**
 *  Copyright (C) 2021 3D Repo Ltd
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
import { LeftPanels } from '@/v4/routes/viewerGui/viewerGui.styles';
import { TitleIcon, ViewerPanelFooter } from '@/v4/routes/viewerGui/components/viewerPanel/viewerPanel.styles';
import { Title, Container as ViewerPanelBody } from '@/v4/routes/components/panel/panel.styles';
import { EmptyStateInfo } from '@/v4/routes/components/components.styles';
import {
	Container as FilterPanelContainer,
	FiltersButton,
	PlaceholderText,
} from '@/v4/routes/components/filterPanel/filterPanel.styles';

export default css`
	${LeftPanels} .MuiPaper-root {
		border-radius: 10px;
	}

	${Title} {
		color: ${({ theme }) => theme.palette.secondary.main};
		background-color: ${({ theme }) => theme.palette.primary.contrast};
		${({ theme }) => theme.typography.h3};
		border-bottom: 1px solid ${({ theme }) => theme.palette.base.light};
		height: 48px;

		.panelTitle { 
			margin: 0 0 0 -16px;
			width: calc(100% + 16px);
		}

		// back arrow icon
		${TitleIcon} .MuiIconButton-root {
			background: transparent;
			color: ${({ theme }) => theme.palette.primary.main};
			border-radius: 0;
		}

		// action icons
		.MuiIconButton-root {
			background-color: #edf0f8; // TODO - fix when new palette is released	
			color: currentColor;
			border-radius: 50%;
			height: 32px;
			width: 32px;
			margin: 0 0 0 5px;	
		}
	}
	
	// Filter components
	${FiltersButton} {
		top: 13px;
	}

	${FilterPanelContainer} {
		.MuiOutlinedInput-notchedOutline {
			border-radius: 0;
			border-right: 0;
			border-left: 0;
			border-top: 0;
		}

		${PlaceholderText} {
			color: ${({ theme }) => theme.palette.base.main};
		}
		
		.MuiButtonBase-root {
			margin: 0;
		}

		.MuiChip-root {
			border-radius: 5px;
			background-color: ${({ theme }) => theme.palette.tertiary.lightest};
			color: ${({ theme }) => theme.palette.secondary.main};
			font-weight: 600;
			margin: 3px 4px 3px 0;

			path {
				fill: ${({ theme }) => theme.palette.secondary.main};
			}
		}
	}

	${ViewerPanelBody} {
		background-color: ${({ theme }) => theme.palette.primary.contrast};
	}

	${ViewerPanelFooter} {
		min-height: 48px;
		${({ theme }) => theme.typography.caption};
		color: ${({ theme }) => theme.palette.base.light} !important;
		box-sizing: border-box;

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
				background-color: ${({ theme }) => theme.palette.base.light};
			}
		}
	}

	${EmptyStateInfo} {
		background-color: transparent;
		color: ${({ theme }) => theme.palette.base.main};
		margin: 0;
	}
`;
