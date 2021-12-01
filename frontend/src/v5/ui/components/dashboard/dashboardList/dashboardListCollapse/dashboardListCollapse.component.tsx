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

import React, { ReactNode, useState } from 'react';
import { Collapse, Tooltip } from '@material-ui/core';
import { Typography } from '@controls/typography';
import { ChevronButton } from '@controls/chevronButton';
import { Container, ButtonContainer, Divider, CollapsedItemContainer } from './dashboardListCollapse.styles';

export type IDashboardListCollapse = {
	children: ReactNode;
	title: ReactNode;
	tooltipTitles?: {
		visible: ReactNode;
		collapsed: ReactNode;
	},
	className?: string;
	isLoading?: boolean;
};

export const DashboardListCollapse = ({
	children, title, tooltipTitles, className, isLoading = false,
}: IDashboardListCollapse): JSX.Element => {
	const [isCollapsed, setIsCollapsed] = useState(false);

	return (
		<Container className={className} $isLoading={isLoading}>
			<ButtonContainer onClick={() => setIsCollapsed((state) => !state)}>
				<Tooltip title={(!isCollapsed ? tooltipTitles?.visible : tooltipTitles?.collapsed) ?? ''}>
					<ChevronButton isOn={!isCollapsed} isLoading={isLoading} />
				</Tooltip>
				<Typography variant="h3" color="secondary">{title}</Typography>
			</ButtonContainer>
			<Collapse in={!isCollapsed}>
				<CollapsedItemContainer>
					{children}
				</CollapsedItemContainer>
			</Collapse>
			<Divider />
		</Container>
	);
};
