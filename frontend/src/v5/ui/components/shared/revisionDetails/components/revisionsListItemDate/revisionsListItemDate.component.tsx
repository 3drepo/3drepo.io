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

import React, { ReactNode } from 'react';
import { FixedOrGrowContainer } from '@controls/fixedOrGrowContainer';
import { Text } from './revisionsListItemDate.styles';

type IDashboardListItemDate = {
	children: ReactNode;
	width?: number;
	tabletWidth?: number;
	mobileWidth?: number;
	className?: string;
	meta?: boolean;
	active?: boolean;
	hideBelowTablet?: boolean;
	hover?: boolean;
};

export const RevisionsListItemDate = ({
	children,
	width,
	tabletWidth,
	mobileWidth,
	className,
	active = false,
	hideBelowTablet = false,
}: IDashboardListItemDate): JSX.Element => (
	<FixedOrGrowContainer
		width={width}
		tabletWidth={tabletWidth}
		mobileWidth={mobileWidth}
		hideBelowTablet={hideBelowTablet}
		className={className}
	>
		<Text $active={active}>
			{children}
		</Text>
	</FixedOrGrowContainer>
);
