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

import { Dispatch, ReactNode } from 'react';
import { FixedOrGrowContainer } from '@controls/fixedOrGrowContainer';
import { Tooltip } from '@mui/material';
import { IFixedOrGrowContainer } from '@controls/fixedOrGrowContainer/fixedOrGrowContainer.component';
import { Title, Subtitle, Container } from './dashboardListItemTitle.styles';

interface IDashboardListItemTitle extends IFixedOrGrowContainer {
	subtitle: ReactNode;
	onClick?: Dispatch<void>;
	tooltipTitle?: ReactNode;
	selected?: boolean;
}

export const DashboardListItemTitle = ({
	children,
	subtitle,
	onClick,
	selected = false,
	tooltipTitle = '',
	...containerProps
}: IDashboardListItemTitle): JSX.Element => (
	<FixedOrGrowContainer {...containerProps}>
		<Container>
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
		</Container>
	</FixedOrGrowContainer>
);
