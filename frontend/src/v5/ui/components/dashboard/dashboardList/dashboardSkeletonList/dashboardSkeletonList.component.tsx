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

import React, { useMemo } from 'react';
import uuid from 'uuidv4';

import { DashboardList } from '@components/dashboard/dashboardList';

interface IDashboardSkeletonList {
	itemsAmount?: number;
	itemComponent: JSX.Element;
}

export const DashboardSkeletonList = ({ itemsAmount = 10, itemComponent }: IDashboardSkeletonList): JSX.Element => {
	const list = useMemo(() => Array(itemsAmount).fill({}), []);

	return (
		<DashboardList>
			{list.map((item, index) => (
				<div key={uuid()}>
					{
						React.cloneElement(itemComponent, {
							delay: index / 10,
							...itemComponent.props,
						})
					}
				</div>
			))}
		</DashboardList>
	);
};
