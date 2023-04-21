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

import EditIcon from '@assets/icons/outlined/edit-outlined.svg';
import ShowIcon from '@assets/icons/outlined/eye-outlined.svg';
import DeleteIcon from '@assets/icons/outlined/delete-outlined.svg';
import {
	Name,
	GroupsCount,
	NameContainer,
	GroupCollectionAccordion,
	CollectionTitle,
	GroupCollectionContainer,
	GroupItemContainer,
} from './groups.styles';
import { IGroupFromApi } from '@/v5/store/tickets/groups/ticketGroups.types';
import { IGroupCollection } from '@/v5/store/tickets/groups/ticketGroups.types';
import { groupBy, partition, keys, values } from 'lodash';
import { GroupIconComponent } from '../../../groups/groupItem/groupIcon/groupIcon.component';
import { ErrorCommentButton, PrimaryCommentButton } from '../../ticketsForm/commentsPanel/comment/commentButton/commentButton.styles';
import { CommentButtons } from '../../ticketsForm/commentsPanel/comment/basicComment/basicComment.styles';
import { rgbaToHex } from '@/v4/helpers/colors';
import { FormattedMessage } from 'react-intl';

type GroupProps = { group: IGroupFromApi, color?: [number, number, number], opacity?: number };
const GroupItem = ({ group, color, opacity }: GroupProps) => {
	const deleteGroup = () => {};
	const toggleShowGroup = () => {};
	const editGroup = () => {};

	const alphaColor = (color || [255, 255, 255]).concat(opacity);
	const alphaHexColor = rgbaToHex(alphaColor.join());

	return (
		<GroupItemContainer>
			<CollectionTitle>
				<GroupIconComponent rules={group.rules} color={alphaHexColor} />
				<NameContainer>
					<Name>{group.name}</Name>
					<GroupsCount>
						<FormattedMessage
							id="groups.item.numberOfMeshes"
							defaultMessage="{count, plural, =0 {No objects} one {# object} other {# objects}}"
							// values={{ count: group.totalSavedMeshes }}
							values={{ count: group.objects.length }}
						/>
					</GroupsCount>
				</NameContainer>
				<CommentButtons>
					<ErrorCommentButton onClick={deleteGroup}>
						<DeleteIcon />
					</ErrorCommentButton>
					<PrimaryCommentButton onClick={toggleShowGroup}>
						<ShowIcon />
					</PrimaryCommentButton>
					<PrimaryCommentButton onClick={editGroup}>
						<EditIcon />
					</PrimaryCommentButton>
				</CommentButtons>
			</CollectionTitle>
		</GroupItemContainer>
	);
};

type GroupCollectionProps = { groups: IGroupCollection[], previousGroupLength: number };
const GroupCollection = ({ groups, previousGroupLength }: GroupCollectionProps) => {
	const title = groups[0].prefix[0];
	const nextPrefixGroups = groups.map(({ prefix, ...group }) => ({
		...group,
		prefix: prefix.slice(1),
	}));
	
	return (
		<GroupCollectionAccordion
			title={
				<CollectionTitle>
					<NameContainer>
						<Name>{title}-{previousGroupLength}</Name>
					</NameContainer>
				</CollectionTitle>
			}
		>
			<GroupCollectionContainer>
				<Groups groups={nextPrefixGroups}/>
			</GroupCollectionContainer>
		</GroupCollectionAccordion>
	);
};

type GroupsProps = { groups: IGroupCollection[] };
export const Groups = ({ groups }: GroupsProps) => {
	const [groupBatches, groupItems] = partition(groups, (g) => g.prefix?.length);
	const collectionsDict = groupBy(groupBatches, (g) => g.prefix[0]);
	const collections = values(collectionsDict);
	const groupsByPrefix = groupBy(groups, 'prefix');
	const groupsByPrefixIndices = keys(groupsByPrefix);

	return (
		<>
			{groupItems.map((group) => (<GroupItem {...group} />))}
			{collections.map((collection, index) => (
				<GroupCollection
					groups={collection}
					previousGroupLength={groupsByPrefix[groupsByPrefixIndices[index]].length}
				/>
			))}
		</>
	);
};
