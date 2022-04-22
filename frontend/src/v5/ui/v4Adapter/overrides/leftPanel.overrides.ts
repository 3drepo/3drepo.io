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
import { Container as FilterPanelContainer, StyledIconButton as FilterIcon, ButtonWrapper } from '@/v4/routes/components/filterPanel/filterPanel.styles';
import { MenuFooter, StyledListItem } from '@/v4/routes/components/filterPanel/components/filtersMenu/filtersMenu.styles';

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

		// back arrow icon
		${TitleIcon} .MuiIconButton-root {
			background: transparent;
			color: ${({ theme }) => theme.palette.primary.main};
			border-radius: 0;
		}

		// action icons
		.MuiIconButton-root {
			background-color: #edf0f8;
			color: currentColor;
			border-radius: 50%;
			height: 32px;
			width: 32px;
		}
	}
	
	// !NOT WORKING
	${FilterPanelContainer} {
		padding: 20px;
		background-color: purple;

		button {
			background-color: blue;
		}

		.MuiInputBase-root {
			background-color: red;
			padding: 10px;
		}
		
		.MuiButtonBase-root {
			margin: 0;
			background-color: yellow;
		}
	}

	${ViewerPanelBody} {
		background-color: ${({ theme }) => theme.palette.primary.contrast};
	}

	// Filter components
	.MuiChip-root {
		border-radius: 5px;
		background-color: ${({ theme }) => theme.palette.tertiary.lightest};
		color: ${({ theme }) => theme.palette.secondary.main};
		font-weight: 600;

		path {
			fill: ${({ theme }) => theme.palette.secondary.main};
		}
	}

	// TODO - contain this style in the search field component
	.MuiOutlinedInput-notchedOutline {
		border-radius: 0;
		border-right: 0;
		border-left: 0;
	}

	${ButtonWrapper} {
		background-color: purple;
	}

	// !NOT WORKING
	${FilterIcon} {
		&& {
			margin: 0;
			background-color: blue !important;
		}
	}

	// !NOT WORKING
	${StyledListItem} {
		min-width: fit-content !important;
	}

	${MenuFooter} {
		padding: 8px 0 8px 8px;
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
		}
	}

	${EmptyStateInfo} {
		background-color: transparent;
		color: ${({ theme }) => theme.palette.base.main};
		margin: 0;
	}
`;
