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

export default css`
	.MuiSnackbar-root {
		right: 138px;
		bottom: 21px;
		
		& > .MuiPaper-root {
			padding: 6px 14px 6px 20px;
			border-radius: 10px;
			background-color: ${({ theme }) => theme.palette.primary.contrast};
			color: ${({ theme }) => theme.palette.secondary.main};
			text-transform: unset;
			line-height: 21px;
			letter-spacing: 0;
			font-size: 14px;
			font-weight: 500;
			width: 344px;

			.MuiSnackbarContent-message {
				max-width: 270px;
				word-break: break-all;
			}

			.MuiSnackbarContent-action {
				padding: 0;

				button {
					margin: 0;
					background-color: transparent;
				}
			}
		}
	}
`;
