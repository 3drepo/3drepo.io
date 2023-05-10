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

import { IGroupCollection } from '@/v5/store/tickets/groups/ticketGroups.types';
import { groupBy, partition, values } from 'lodash';
import {
	CollectionHeadline,
	CollectionAccordion,
	GroupsContainer,
} from './groups.styles';
import { GroupToggle } from '../groupToggle/groupToggle.component';
import { Name, NameContainer } from './groupItem/groupItem.styles';
import { GroupItem } from './groupItem/groupItem.component';

type GroupsProps = { groups: IGroupCollection[], colored: boolean };
export const Groups = ({ groups, colored }: GroupsProps) => {
	const [groupBatches, groupItems] = partition(groups, (g) => g.prefix?.length);
	const collectionsDict = groupBy(groupBatches, (g) => g.prefix[0]);
	const collections = values(collectionsDict);

	const collectionToGroup = (collection) => collection.map(({ prefix, ...group }) => ({
		...group,
		prefix: prefix.slice(1),
	}));

	return (
		<>
			{groupItems.map((group) => (<GroupItem {...group} colored={colored} key={group.group._id} />))}
			{collections.map((collection) => (
				<CollectionAccordion
					title={(
						<>
							<CollectionHeadline>
								<NameContainer>
									<Name>{collection[0].prefix[0]}</Name>
								</NameContainer>
							</CollectionHeadline>
							<GroupToggle colored={colored} onClick={(e) => e.stopPropagation()} />
						</>
					)}
				>
					<GroupsContainer>
						<Groups groups={collectionToGroup(collection)} colored={colored} />
					</GroupsContainer>
				</CollectionAccordion>
			))}
		</>
	);
};
