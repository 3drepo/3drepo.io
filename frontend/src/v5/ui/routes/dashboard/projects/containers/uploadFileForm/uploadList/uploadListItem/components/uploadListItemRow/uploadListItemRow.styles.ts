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

import styled, { css } from 'styled-components';
import { CircleButton } from '@controls/circleButton';
import { Container as ItemRowContainer } from '@components/dashboard/dashboardList/dashboardListItem/components/dashboardListItemRow/dashboardListItemRow.styles';
import { DashboardListItem } from '@components/dashboard/dashboardList';
import { DestinationAutocomplete } from '../uploadListItemDestination/uploadListItemDestination.styles';
import { RevisionTagField } from '../uploadListItemRevisionTag/uploadListItemRevisionTag.styles';

export const UploadListItemButton = styled(CircleButton)`
	margin: 0;
	&:hover, &.Mui-focusVisible { 
		box-shadow: none;
	}
`;

const DestinationAndTagDimensions = css`
	width: 340px;
	height: 35px;
	min-width: 80px;
`;

export const UploadListItem = styled(DashboardListItem)<{ selected: boolean }>`
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
				fieldset, &:hover fieldset {
					border: 0;
				}

				&.MuiOutlinedInput-root:not(.Mui-error) {
					background-color: ${theme.palette.secondary.light};

					input {
						color: ${theme.palette.primary.contrast};
					}
				}
			`}
		}
	}
`;
