/**
 *  Copyright (C) 2023 3D Repo Ltd
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
import { DashboardListItem } from '@components/dashboard/dashboardList';
import { DestinationAutocomplete } from '@components/shared/uploadFiles/uploadList/uploadListItem/uploadListItemDestination/uploadListItemDestination.styles';
import { RevisionTagField } from './uploadListItem/components/uploadListItemRevisionTag/uploadListItemRevisionTag.styles';

const DestinationAndTagDimensions = css`
	width: 340px;
	height: 35px;
`;

export const UploadListItemRowWrapper = styled(DashboardListItem)<{ selected: boolean; order: number }>`
	${({ order }) => css`order: ${order}`};
	${ItemRowContainer} {
		padding: 8px 15px 8px 5px;
		height: auto;
		cursor: default;
		overflow: hidden;

		${DestinationAutocomplete} {
			${DestinationAndTagDimensions}
		}

		${RevisionTagField} {
			${DestinationAndTagDimensions}
			${({ selected, theme }) => selected && css`
				>.MuiOutlinedInput-root:not(.Mui-error) {
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
	}
`;
