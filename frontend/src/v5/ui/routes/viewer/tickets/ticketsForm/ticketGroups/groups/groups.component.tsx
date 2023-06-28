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

import { groupBy, isString, partition } from 'lodash';
import { useContext } from 'react';
import {
	CollectionHeadline,
	CollectionAccordion,
	GroupsContainer,
	Name,
} from './groups.styles';
import { GroupToggle } from '../groupToggle/groupToggle.component';
import { NameContainer } from './groupItem/groupItem.styles';
import { GroupItem } from './groupItem/groupItem.component';
import { TicketGroupsContext } from '../ticketGroupsContext';
import { IndexedOverride, getCollectionCheckboxState } from '../ticketGroupsContext.helper';

type GroupsProps = {
	indexedOverrides: IndexedOverride[],
	level?: number,
};
export const Groups = ({ indexedOverrides, level = 0 }: GroupsProps) => {
	const { getCollectionState, toggleCollection } = useContext(TicketGroupsContext);
	const [overrideItems, overrideBatches] = partition(indexedOverrides, (o) => (o.prefix?.length || 0) === level);
	const overridesByPrefix = groupBy(overrideBatches, (o) => o.prefix[level]);

	const handleCheckboxClick = (e, overrides) => {
		e.stopPropagation();
		// toggling all the groups descendants of this collection
		toggleCollection(overrides.map(({ index }) => index));
	};

	return (
		<>
			{overrideItems.map(({ index, ...override }) => (
				<GroupItem
					override={override}
					key={isString(override.group) ? override.group : override.group._id || index}
					index={index}
				/>
			))}
			{Object.entries(overridesByPrefix).map(([prefix, overrides]) => (
				<CollectionAccordion
					title={(
						<>
							<CollectionHeadline>
								<NameContainer>
									<Name>{prefix}</Name>
								</NameContainer>
							</CollectionHeadline>
							<GroupToggle
								onClick={(e) => handleCheckboxClick(e, overrides)}
								{...getCollectionCheckboxState(getCollectionState(overrides.map(({ index }) => index)))}
							/>
						</>
					)}
				>
					<GroupsContainer>
						<Groups indexedOverrides={overrides} level={level + 1} />
					</GroupsContainer>
				</CollectionAccordion>
			))}
		</>
	);
};
