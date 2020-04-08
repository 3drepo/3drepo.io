/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import styled from 'styled-components';

import ChipInput from 'material-ui-chip-input';

export const StyledChipInput = styled(ChipInput)`
	&& {
		margin-top: 10px;

		> div {
			min-height: 32px;

			&::before  {
				border-bottom-color: rgba(0, 0, 0, .12) !important;
			}
		}

		div[role="button"] {
			height: 24px;

			> span {
				padding-left: 8px;
				padding-right: 8px;
			}

			> svg {
				width: 16px;
				height: 16px;
				margin-left: -4px;
				margin-right: 4px;
			}
		}

		div > input {
			transform: translateY(-3px);
		}
	}
`;
