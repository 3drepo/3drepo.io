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
	#tickets {
		.MuiChip-root {
			${({ theme }) => theme.typography.body2};
			font-size: 0.5rem;
			text-transform: uppercase;
			padding: 3px 7px;
			border-width: 1px;
			border-radius: 6px;
			height: 20px;
			gap: 4px;
			user-select: none;
			margin: 0;
			letter-spacing: 0.7;
			svg {
				height: 11px;
				width: 11px;
			}
		}
		.MuiChip-label {
			padding: 0;
		}
		.MuiChip-icon {
			color: inherit;
			margin: 0;
		}
	} 
`;
