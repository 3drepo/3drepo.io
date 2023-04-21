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
import GroupsIcon from '@mui/icons-material/GroupWork';
import {
	Name,
	GroupsCount,
	NameContainer,
	GroupOfGroupsContainer,
	GroupsAccordionContainer,
	CollectionTitle,
	GroupCollection,
	GroupItem,
} from './groups.styles';
import { IGroupFromApi } from '@/v5/store/tickets/groups/ticketGroups.types';
import { ColoredGroupCollection } from '@/v5/store/tickets/groups/ticketGroups.types';
import { TransformedGroupCollection } from '@/v5/store/tickets/groups/ticketGroups.types';
import { HiddenGroupCollection } from '@/v5/store/tickets/groups/ticketGroups.types';
import { groupBy, partition, keys, values } from 'lodash';
import { GroupIconComponent } from '../../../groups/groupItem/groupIcon/groupIcon.component';
import { ErrorCommentButton, PrimaryCommentButton } from '../../ticketsForm/commentsPanel/comment/commentButton/commentButton.styles';
import { CommentButtons } from '../../ticketsForm/commentsPanel/comment/basicComment/basicComment.styles';
import { rgbaToHex } from '@/v4/helpers/colors';
import { FormattedMessage } from 'react-intl';
import { EmptyListMessage } from '@controls/dashedContainer/emptyListMessage/emptyListMessage.styles';

type GroupProps = { group: IGroupFromApi, color?: [number, number, number], opacity?: number };
const Group = ({ group, color, opacity }: GroupProps) => {
	const deleteGroup = () => {};
	const toggleShowGroup = () => {};
	const editGroup = () => {};

	const alphaColor = (color || [255, 255, 255]).concat(opacity);
	const alphaHexColor = rgbaToHex(alphaColor.join());

	return (
		<GroupItem>
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
		</GroupItem>
	);
};

type GroupCollection = ColoredGroupCollection | HiddenGroupCollection | TransformedGroupCollection;

type GroupOfGroupsProps = { groups: GroupCollection[], previousGroupLength: number };
const GroupOfGroups = ({ groups,  previousGroupLength }: GroupOfGroupsProps) => {
	const title = groups[0].prefix[0];
	const nextPrefixGroups = groups.map(({ prefix, ...group }) => ({
		...group,
		prefix: prefix.slice(1),
	}));
	
	return (
		<GroupCollection
			title={
				<CollectionTitle>
					<NameContainer>
						<Name>{title}-{previousGroupLength}</Name>
					</NameContainer>
				</CollectionTitle>
			}
		>
			<GroupOfGroupsContainer>
				<Groups groups={nextPrefixGroups}/>
			</GroupOfGroupsContainer>
		</GroupCollection>
	);
};

type GroupsProps = { groups: GroupCollection[] };
export const Groups = ({ groups }: GroupsProps) => {
	const [groupOfGroups, groupItems] = partition(groups, (g) => g.prefix?.length);
	const collectionsDict = groupBy(groupOfGroups, (g) => g.prefix[0]);
	const collections = values(collectionsDict);
	const groupsByPrefix = groupBy(groups, 'prefix');
	const groupsByPrefixIndices = keys(groupsByPrefix);

	return (
		<>
			{groupItems.map((group) => (<Group {...group} />))}
			{collections.map((collection, index) => (
				<GroupOfGroups
					groups={collection}
					previousGroupLength={groupsByPrefix[groupsByPrefixIndices[index]].length}
				/>
			))}
		</>
	);
};

type GroupsAccordionProps = {
	title: any;
	groups: GroupCollection[];
	children: any;
}
export const GroupsAccordion = ({ title, groups, children }: GroupsAccordionProps) => (
	<GroupsAccordionContainer
		Icon={GroupsIcon}
		title={title}
		groupsCount={groups.length}
	>
		{groups?.length ? (
			<Groups groups={groups} />
		) : (
			<EmptyListMessage>
				<FormattedMessage
					id="ticketCard.groupsList.empty"
					defaultMessage="No Groups"
				/>
			</EmptyListMessage>
		)}
		{children}
	</GroupsAccordionContainer>
);
