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

import React from 'react';
import { FixedOrGrowContainer } from '@controls/fixedOrGrowContainer';
import { Container, SkeletonBlock } from './skeletonListItem.styles';

interface ISkeletonListItem {
	delay?: number;
}

export const SkeletonListItem = ({ delay = 0 }: ISkeletonListItem): JSX.Element => (
	<Container>
		<FixedOrGrowContainer width={130}>
			<SkeletonBlock delay={delay} widthPercentage={60} />
		</FixedOrGrowContainer>
		<FixedOrGrowContainer width={228}>
			<SkeletonBlock delay={delay} widthPercentage={80} />
		</FixedOrGrowContainer>
		<FixedOrGrowContainer width={330}>
			<SkeletonBlock delay={delay} widthPercentage={55} />
		</FixedOrGrowContainer>
		<FixedOrGrowContainer>
			<SkeletonBlock delay={delay} widthPercentage={75} />
		</FixedOrGrowContainer>
	</Container>
);
