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
import { FixedOrGrowContainer } from '@controls/fixedOrGrowContainer';
import { Tooltip } from '@material-ui/core';
import { Title, Subtitle } from './dashboardListItemTitle.styles';

type IDashboardListItemTitle = {
	children?: ReactNode;
	subtitle: ReactNode;
	width?: number;
	onClick?: Dispatch<void>;
	tooltipTitle?: ReactNode;
	className?: string;
	selected?: boolean;
};

export const DashboardListItemTitle = ({
	children, subtitle, width, onClick, className, selected = false, tooltipTitle = '',
}: IDashboardListItemTitle): JSX.Element => (
	<FixedOrGrowContainer width={width} className={className}>
		<Tooltip title={tooltipTitle}>
			<Title
				onClick={(event) => {
					event.stopPropagation();
					onClick(event);
				}}
				selected={selected}
			>
				{children}
			</Title>
		</Tooltip>
		<Subtitle selected={selected}>{subtitle}</Subtitle>
	</FixedOrGrowContainer>
);
