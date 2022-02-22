/**
 *  Copyright (C) 2021 3D Repo Ltd
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
import * as DashboardListItemRowStyles from '@components/dashboard/dashboardList/dashboardListItem/components/dashboardListItemRow/dashboardListItemRow.styles';

export const Container = styled.li`
	box-sizing: border-box;
	height: 100%;
	width: 100%;
	list-style: none;
	border: 1px solid ${({ theme }) => theme.palette.base.lightest};
	border-bottom-style: none;

	&:last-child {
		border-radius: 0 0 5px 5px;
		border-bottom-style: solid;

		${DashboardListItemRowStyles.Container} {
			${({ selected }) => selected && css`
				&:only-child {
					border-bottom-left-radius: 5px;
					border-bottom-right-radius: 5px;
				}
				& + * {
					border-radius: 0 0 5px 5px;
				}
			`}
			
			${({ selected }) => !selected && css`
				border-radius: 0 0 5px 5px;
			`}
		}
	}

	&:first-child {
		border-radius: 5px 5px 0 0;

		${DashboardListItemRowStyles.Container} {
			border-radius: 5px 5px 0 0;
		}
	}

	&:only-child {
		border-radius: 5px;

		${DashboardListItemRowStyles.Container} {
			${({ selected }) => selected && css`
				& + * {
					border-radius: 0 0 5px 5px;
				}
			`}
			${({ selected }) => !selected && css`
				border-radius: 5px;
			`}
		}
	}

	${({ selected }) => selected && css`
		border: none !important;
	`}
`;
