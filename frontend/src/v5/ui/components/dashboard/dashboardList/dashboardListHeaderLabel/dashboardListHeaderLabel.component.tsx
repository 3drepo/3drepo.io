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

import React, { Dispatch, ReactNode } from 'react';
import ArrowIcon from '@assets/icons/arrow.svg';
import { SortingDirection } from '@components/dashboard/dashboardList/dashboardList.types';
import { IFixedOrGrowContainer } from '@controls/fixedOrGrowContainer/fixedOrGrowContainer.component';
import { Container, Button, Indicator, Label } from './dashboardListHeaderLabel.styles';

interface IDashboardListHeaderLabel extends IFixedOrGrowContainer{
	children?: ReactNode;
	sortingDirection?: SortingDirection;
	sort?: boolean;
	name?: string;
	onClick?: Dispatch<void>;
}

export const DashboardListHeaderLabel = ({
	children,
	sortingDirection,
	onClick,
	sort = false,
	...containerProps
}: IDashboardListHeaderLabel): JSX.Element => (
	<Container
		{...containerProps}
	>
		{sort ? (
			<Button onClick={onClick}>
				<Label>
					{children}
				</Label>
				{sortingDirection && (
					<Indicator sortingDirection={sortingDirection}>
						<ArrowIcon />
					</Indicator>
				)}
			</Button>
		) : (
			<Label>
				{children}
			</Label>
		)}
	</Container>
);
