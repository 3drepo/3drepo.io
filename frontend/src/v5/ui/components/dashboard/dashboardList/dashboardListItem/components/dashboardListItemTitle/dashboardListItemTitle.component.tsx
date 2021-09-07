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

import { FixedOrGrowContainer } from '@components/dashboard/dashboardList/dasboardList.styles';
import React, { Dispatch, ReactNode } from 'react';
import { Title, Subtitle } from './dashboardListItemTitle.styles';

type IDashboardListItemTitle = {
	children?: ReactNode;
	subtitle: string;
	width?: number;
	onClick?: Dispatch<void>;
};

export const DashboardListItemTitle = ({
	children, subtitle, width, onClick,
}: IDashboardListItemTitle): JSX.Element => (
	<FixedOrGrowContainer width={width}>
		<Title onClick={onClick}>
			{children}
		</Title>
		<Subtitle>{subtitle}</Subtitle>
	</FixedOrGrowContainer>
);
