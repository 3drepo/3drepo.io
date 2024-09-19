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

import styled from 'styled-components';
import { TextField } from '../../../inputs';

export const RevisionTagField = styled(TextField)`
	margin: 0 12px;

	.MuiFormHelperText-root {
		display: none;
	}

	.MuiOutlinedInput-root {
		height: 100%;
		border-radius: 8px;

		&.Mui-error {
			svg {
				overflow: visible;
			}
			.MuiInputBase-input {
				padding-left: 0;
			}
		}

		&, &.Mui-focused, &.Mui-error, &.Mui-focused.Mui-error {
			& > .MuiInputBase-input {
				border: 0;
				box-shadow: none;

				&.Mui-disabled {
					-webkit-text-fill-color: ${({ theme }) => theme.palette.secondary.main};
				}
			}
		}

		&.Mui-disabled {
			background-color: ${({ theme }) => theme.palette.tertiary.lightest};

			input {
				font-weight: bold;
				-webkit-text-fill-color: ${({ theme }) => theme.palette.secondary.main};
			}

			fieldset {
				border: 0;
			}
		}
	}
`;
