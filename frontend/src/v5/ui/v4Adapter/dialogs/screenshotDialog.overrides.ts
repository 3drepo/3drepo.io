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
import {
	OptionsDivider,
	ToolsContainer,
	IconButton,
	MenuItem,
} from '@/v4/routes/components/screenshotDialog/components/tools/tools.styles';
import { ColorSelect } from '@/v4/routes/components/colorPicker/colorPicker.styles';
import { Container as AddShapeContainer } from '@/v4/routes/components/buttonMenu/buttonMenu.styles';
import { SmallIconButtonStyled } from '@/v4/routes/components/smallIconButon/smallIconButton.styles';
import { MenuList } from '@/v4/routes/components/filterPanel/components/filtersMenu/filtersMenu.styles';

export default css`
	// brush and text sizes drop-down
	${MenuItem}${MenuItem} { 
		padding: 4px 20px 4px 0;
		height: 34px;
		
		&:not(:hover) {
			background-color: ${({ theme }) => theme.palette.primary.contrast};
		}

		button {
			&:hover {
				background-color: transparent;
			}

			span {
				svg {
					font-size: 15px !important;
				}

				span {
					font-size: 12px;
					font-weight: 400;
					width: 10px;
					display: flex;
					justify-content: flex-start;
				}
			}
		}

		span {
			color: ${({ theme }) => theme.palette.secondary.main};
		}
	}

	${ToolsContainer} {
		background-color: ${({ theme }) => theme.palette.primary.contrast};
		border-radius: 10px;
		padding: 0 16px 0 36px;

		${OptionsDivider} {
			border-color: ${({ theme }) => theme.palette.base.lightest};
			height: 82px;
		}

		// color picker
		${ColorSelect} {
			width: max-content;
		}

		// brush and text size selector
		.MuiInputBase-colorPrimary {
			margin: 0 0 0 6px;
			width: 62px;
			justify-content: center;
			align-items: center;
			
			// brush/text icon
			button svg {
				font-size: 19px !important;
				padding-left: 12px;
			}

			.MuiSelect-select {
				margin: 0;
				padding: 0 !important;
				text-align: left !important;
				width: 62px;
				border: none;

				& ~ fieldset {
					border: none;
					/* padding-right: 15px; */
				}

				// little size icon (XS, S, M, etc.)
				.MuiBadge-badge {
					padding: 0;
					font-size: 10px;
					color: ${({ theme }) => theme.palette.secondary.main};
				}

				& ~ svg {
					margin-top: 2px;
					transform: scale(.8);
					right: 9px;
				}

				button {
					margin: 0;
					/* padding-left: 5px; */
					padding: 0;
				}
			}
		}

		// add shape icon and chevron icon
		${AddShapeContainer} {
			${IconButton} {
				margin: 5px 0 5px 5px;
				padding: 8px 0 8px 8px;
			}

			${SmallIconButtonStyled} {
				padding-left: 0;
				margin-left: 8px;
				border-radius: 0;
				overflow: hidden;
			}
		}

		// eraser icon 
		[aria-label="Erase"] {
			span {
				width: 20px;
    			height: 20px;

				svg {
					width: 100%;
				}
			}

			.secondary {
				color: ${({ theme }) => theme.palette.secondary.main};
			}
	
			.primary {
				color: ${({ theme }) => theme.palette.primary.main};
			}
		}

		// remove bg circle around icons
		& > :not(:last-child):not(.Mui-disabled) {
			.MuiIconButton-root:hover {
				background-color: transparent;
			}
		}

		.MuiIconButton-sizeMedium {
			padding: 10px;
			margin: 5px;
		}
	}

	// Add shape menu
	${MenuList} {
		span {
			color: ${({ theme }) => theme.palette.secondary.main};

			&:hover {
				background-color: transparent;
				color: ${({ theme }) => theme.palette.primary.main};
			}
		}
	}
`;
