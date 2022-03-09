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

import { Dispatch, ReactNode, SyntheticEvent } from 'react';
import { FixedOrGrowContainer } from '@controls/fixedOrGrowContainer';
import { Tooltip } from '@material-ui/core';
import { IFixedOrGrowContainer } from '@controls/fixedOrGrowContainer/fixedOrGrowContainer.component';
import { Button } from './dashboardListItemButton.styles';

interface IDashboardListItemButton extends IFixedOrGrowContainer {
	onClick: Dispatch<SyntheticEvent>;
	tooltipTitle?: ReactNode;
}

export const DashboardListItemButton = ({
	onClick,
	tooltipTitle = '',
	children,
	...containerProps
}: IDashboardListItemButton): JSX.Element => (
	<FixedOrGrowContainer {...containerProps}>
		<Tooltip title={tooltipTitle}>
			<Button onClick={(event) => {
				event.stopPropagation();
				onClick(event);
			}}
			>
				{children}
			</Button>
		</Tooltip>
	</FixedOrGrowContainer>
);
