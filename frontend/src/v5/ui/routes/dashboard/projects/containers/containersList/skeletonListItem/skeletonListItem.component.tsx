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

import { SkeletonBlock } from '@controls/skeletonBlock/skeletonBlock.styles';
import { FixedOrGrowContainer } from '@controls/fixedOrGrowContainer';
import { TitlesContainer, Container } from './skeletonListItem.styles';

import type { JSX } from "react";

interface ISkeletonListItem {
	delay?: number;
}

export const SkeletonListItem = ({ delay = 0 }: ISkeletonListItem): JSX.Element => (
	<Container>
		<FixedOrGrowContainer>
			<TitlesContainer>
				<SkeletonBlock delay={delay} width="90%" />
				<SkeletonBlock delay={delay + 0.05} width="80%" />
			</TitlesContainer>
		</FixedOrGrowContainer>
		<FixedOrGrowContainer width={186} />
		<FixedOrGrowContainer>
			<SkeletonBlock delay={delay} width="75%" />
		</FixedOrGrowContainer>
		<FixedOrGrowContainer width={188}>
			<SkeletonBlock delay={delay} width={133} />
		</FixedOrGrowContainer>
		<FixedOrGrowContainer width={97}>
			<SkeletonBlock delay={delay} width={65} />
		</FixedOrGrowContainer>
	</Container>
);
