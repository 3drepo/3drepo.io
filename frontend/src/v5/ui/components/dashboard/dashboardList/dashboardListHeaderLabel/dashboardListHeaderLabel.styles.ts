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
import { Button as ButtonComponent } from '@controls/button';
import { SortingDirection } from '@components/dashboard/dashboardList/dashboardList.types';
import { FixedOrGrowContainer } from '@controls/fixedOrGrowContainer';
import { Typography } from '@controls/typography';
import { Display } from '@/v5/ui/themes/media';

export const Container = styled(FixedOrGrowContainer)`
	align-items: center;
	display: flex;
	
	${({ hideWhenSmallerThan }: { hideWhenSmallerThan: Display }) => hideWhenSmallerThan && css`
		@media (max-width: ${hideWhenSmallerThan}px) {
			display: none;
		}
	`};
`;

export const Label = styled(Typography).attrs({
	variant: 'kicker',
})`
	color: ${({ theme }) => theme.palette.base.main};
	line-height: normal;
`;

export const Button = styled(ButtonComponent).attrs({
	variant: 'text',
})`
	justify-content: flex-start;
	padding: 0;
	margin: 0;

	&:hover, &:active {
		text-decoration-line: none;
	}
`;

export const Indicator = styled.div`
	margin-left: 5px;
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100%;

	svg {
		height: 7px;
		width: 100%;
	}

	${({ sortingDirection }) => sortingDirection === SortingDirection.ASCENDING && css`
		svg {
			transform: rotate(180deg);
		}
	`};
`;
