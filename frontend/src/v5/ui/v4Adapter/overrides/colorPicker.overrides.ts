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
import { Canvas, ColorSelect, Dot, StyledIconButton } from '@/v4/routes/components/colorPicker/colorPicker.styles';

export default css`
	// color picker button
	${ColorSelect} {
		width: unset;
		padding-left: 8px;
		border-radius: 5px;
		background-color: ${({ theme }) => theme.palette.tertiary.lightest};

		${Dot} {
			width: 13px;
			height: 13px;
		}

		${StyledIconButton} {
			margin: 0;

			&:hover {
				background-color: transparent;
			}
		}
	}

	${Canvas} {
		height: 184px;
	}
	
	.color-picker__panel { // Colour picker modal
		width: 260px;

		.MuiInput-root {
			border: 1px solid ${({ theme }) => theme.palette.base.lightest};
			border-Radius: 8px;
			padding: 0 7px;
			width: auto;

			&.Mui-focused {
				border: 1px solid ${({ theme }) => theme.palette.primary.main};
				box-shadow: 0 0 2px ${({ theme }) => theme.palette.primary.main};
			}

			.MuiInput-input {
				font-size: 12px;
				margin-left: -13px;
				padding: 0 12px;
			}

			.MuiInputAdornment-positionEnd {
				margin: 0 0 0 -30px;
			}
		}

		.colorPicker {
			margin: 0;
		}

		.MuiSlider-root {
			width: 145px;
			margin-right: 15px;
		}

		.MuiCheckbox-root {
			margin: 8px 8px 8px -8px;
		}
	}
`;
