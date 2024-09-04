/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import styled, { css } from 'styled-components';
import { Container as ItemRowContainer } from '@components/dashboard/dashboardList/dashboardListItem/components/dashboardListItemRow/dashboardListItemRow.styles';
import { DashboardListHeaderLabel, DashboardListItem } from '@components/dashboard/dashboardList';
import { RevisionCodeTextField } from './uploadListItem/components/uploadListItemRevisionCode/uploadListItemRevisionCode.styles';
import { DestinationAutocomplete } from '@components/shared/uploadFiles/uploadList/uploadListItem/uploadListItemDestination/uploadListItemDestination.styles';
import { Autocomplete as StatusCode } from './uploadListItem/components/uploadListItemStatusCode/uploadListItemStatusCode.styles';
import { DashboardListItemTitle } from '@components/shared/uploadFiles/uploadList/uploadListItem/uploadListItemTitle/uploadListItemTitle.styles';

export const Label = styled(DashboardListHeaderLabel)<{ required?: boolean }>`
	margin-right: 12px;

	button {
		max-width: 100%;
		min-width: 38px;
	}
	
	p {
		overflow: hidden;
		white-space: nowrap;
		max-width: 100%;
		text-overflow: ellipsis;
	}

	${({ required, theme }) => required && css`
		&::after {
			content: '*';
			color: ${theme.palette.error.main};
		}
	`}
`;

export const UploadListItemRowWrapper = styled(DashboardListItem)<{ selected: boolean; order: number }>`
	${({ order }) => css`order: ${order}`};

	${ItemRowContainer} {
		padding: 8px 15px 8px 5px;
		height: auto;
		cursor: default;
		overflow: hidden;

		${DashboardListItemTitle} {
			min-width: 17px;
		}

		${DestinationAutocomplete} {
			width: 341px;
			min-width: 110px;
			height: 35px;
		}

		${StatusCode} {
			width: 97px;
			min-width: 90px;
		}

		${RevisionCodeTextField} {
			width: 146px;
			min-width: 85px;
		}

		${({ selected, theme }) => selected && css`
			${RevisionCodeTextField} > .MuiOutlinedInput-root:not(.Mui-error) {
				background-color: ${theme.palette.secondary.light};

				input {
					color: ${theme.palette.primary.contrast};
				}

				&:not(.Mui-focused) fieldset {
					border: unset;
				}
			}
		`}
	}
`;
