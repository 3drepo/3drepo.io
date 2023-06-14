/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { GroupOverride } from '@/v5/store/tickets/tickets.types';
import { groupBy, isString, partition } from 'lodash';
import {
	CollectionHeadline,
	CollectionAccordion,
	GroupsContainer,
} from './groups.styles';
import { GroupToggle } from '../groupToggle/groupToggle.component';
import { Name, NameContainer } from './groupItem/groupItem.styles';
import { GroupItem } from './groupItem/groupItem.component';

type GroupsProps = {
	indexedOverrides: (GroupOverride & { index: number})[],
	level?: number,
};
export const Groups = ({ indexedOverrides, level = 0 }: GroupsProps) => {
	const [overrideItems, overrideBatches] = partition(indexedOverrides, (g) => (g.prefix?.length || 0) === level);
	const overridesByPrefix = groupBy(overrideBatches, (g) => g.prefix[level]);

	const a = overridesByPrefix[2];

	return (
		<>
			{overrideItems.map(({ index, ...override }) => (
				<GroupItem
					group={override.group}
					key={isString(override.group) ? override.group : override.group._id || index}
					index={index}
				/>
			))}
			{Object.keys(overridesByPrefix).map((prefix) => (
				<CollectionAccordion
					title={(
						<>
							<CollectionHeadline>
								<NameContainer>
									<Name>{prefix}</Name>
								</NameContainer>
							</CollectionHeadline>
							<GroupToggle onClick={(e) => e.stopPropagation()} />
						</>
					)}
				>
					<GroupsContainer>
						<Groups indexedOverrides={overridesByPrefix[prefix]} level={level + 1} />
					</GroupsContainer>
				</CollectionAccordion>
			))}
		</>
	);
};
