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
import { Typography } from '@controls/typography';
import { Container, Button, Indicator } from './dashboardListHeaderLabel.styles';

type IDashboardListHeaderLabel = {
	children?: ReactNode;
	sortingDirection?: SortingDirection;
	sort?: boolean;
	onClick?: Dispatch<void>;
	width?: number;
	className?: string;
};

export const DashboardListHeaderLabel = ({
	children,
	sortingDirection,
	onClick,
	width,
	sort = false,
	className,
}: IDashboardListHeaderLabel): JSX.Element => (
	<Container width={width} className={className}>
		{sort ? (
			<Button onClick={onClick}>
				<Typography variant="kicker">
					{children}
				</Typography>
				{sortingDirection && (
					<Indicator sortingDirection={sortingDirection}>
						<ArrowIcon />
					</Indicator>
				)}
			</Button>
		) : (
			<Typography variant="kicker">
				{children}
			</Typography>
		)}
	</Container>
);
