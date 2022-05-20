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
} from '@/v4/routes/components/screenshotDialog/components/tools/tools.styles';
import { ColorSelect } from '@/v4/routes/components/colorPicker/colorPicker.styles';
import { Container as AddShapeContainer } from '@/v4/routes/components/buttonMenu/buttonMenu.styles';
import { SmallIconButtonStyled } from '@/v4/routes/components/smallIconButon/smallIconButton.styles';

const Toolbar = css`
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

			button {
				margin: 0;
			}
		}

		// brush and text size selector
		[class*=MuiSelect-root] {
			margin: 0 0 0 12px;
			width: 62px;
			justify-content: center;
			align-items: center;

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
				margin-right: 0;
				padding-right: 0;
			}

			${SmallIconButtonStyled} {
				padding-left: 0;
				margin-left: 8px;
				border-radius: 0;
				overflow: hidden;
			}
		}

		// eraser icon 
		.secondary {
			color: ${({ theme }) => theme.palette.secondary.main};
		}

		.primary {
			color: ${({ theme }) => theme.palette.primary.main};
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
`;

// used in the attach resources modal styling file
export default css`
	${Toolbar}
`;