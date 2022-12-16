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
import { StyledChipInput } from '@/v4/routes/components/chipsInput/chipsInput.styles';
import { Headline, StyledForm, StyledGrid } from '@/v4/routes/teamspaceSettings/teamspaceSettings.styles';
import styled from 'styled-components';

export const V5TeamspaceSettingsOverrides = styled.div`
	${StyledForm} {
		.MuiAutocomplete-popper {
			display: none;
		}
		${StyledGrid}:first-of-type {
			display: none;
		}
		${Headline} {
			${({ theme }) => theme.typography.h2};
			color: ${({ theme }) => theme.palette.secondary.main};
		}
		${StyledChipInput} {
			.MuiAutocomplete-tag{
				background-color: ${({ theme }) => theme.palette.tertiary.lightest};
				color: ${({ theme }) => theme.palette.secondary.main};
				border-radius: 5px;
				font-weight: 600;
				font-size: 12px;
				height: 30px;
				padding: 7px 15px;
				.MuiChip-label {
					padding: 0;
				}
				svg {
					margin: 0 0 0 5px;
					color: ${({ theme }) => theme.palette.secondary.main};
				}
			}
			.MuiInputBase-input {
				color: ${({ theme }) => theme.palette.secondary.main};
			}
			fieldset, &:hover fieldset, .Mui-focused fieldset {
				border: none;
				box-shadow: none;
			}
		}
	}
`;
