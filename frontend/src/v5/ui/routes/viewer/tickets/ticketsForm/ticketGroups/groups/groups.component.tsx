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
import { formatMessage } from '@/v5/services/intl';
import { DialogsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { Group, GroupOverride } from '@/v5/store/tickets/tickets.types';
import { convertToV4GroupNodes } from '@/v5/helpers/viewpoint.helpers';
import { useDispatch } from 'react-redux';
import { TreeActions } from '@/v4/modules/tree';
import DeleteIcon from '@assets/icons/outlined/delete-outlined.svg';
import ShowIcon from '@assets/icons/outlined/eye-outlined.svg';
import { TemplatesPermissionsHooksSelectors, TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { TicketButton } from '@/v5/ui/routes/viewer/tickets/ticketButton/ticketButton.styles';
import { useContext } from 'react';
import {
	CollectionHeadline,
	CollectionAccordion,
	GroupsContainer,
	Name,
	Buttons,
} from './groups.styles';
import { GroupOverrideAction } from '../groupOverrideAction/groupOverrideAction.component';
import { NameContainer } from './groupItem/groupItem.styles';
import { GroupItem } from './groupItem/groupItem.component';
import { TicketGroupsContext } from '../ticketGroupsContext';
import { TicketContext } from '../../../ticket.context';
import { GroupState, getCollectionCheckboxState } from '../ticketGroupsContext.helper';

/* eslint-disable @typescript-eslint/no-use-before-define */
const GroupCollection = ({ overrides, prefix, level }) => {
	const { getCollectionState, setCollectionIsChecked, deleteCollection } = useContext(TicketGroupsContext);

	const overrideKeys = overrides.map(({ key }) => key);
	const state = getCollectionState(overrideKeys);
	const { containerOrFederation } = useContext(TicketContext);
	const templateId = TicketsCardHooksSelectors.selectSelectedTemplateId();
	const readOnly = !TemplatesPermissionsHooksSelectors.selectHasDefaultEditPermissionForTemplate(containerOrFederation, templateId);

	const dispatch = useDispatch();

	const handleCheckboxClick = (e) => {
		e.stopPropagation();
		// setting the state for all the groups descendants of this collection
		setCollectionIsChecked(overrideKeys, state !== GroupState.CHECKED);
	};
	const handleDeleteCollection = (e) => {
		e.stopPropagation();
		DialogsActionsDispatchers.open('delete', {
			name: prefix,
			message: formatMessage({
				id: 'deleteModal.groups.message',
				defaultMessage: 'By deleting these groups your data will be lost permanently and will not be recoverable.',
			}),
			onClickConfirm: () => deleteCollection(overrideKeys),
			confirmLabel: formatMessage({ id: 'deleteModal.groupCollection.confirmButton', defaultMessage: 'Delete Groups' }),
		});
	};

	const isolateCollection = (e) => {
		e.stopPropagation();
		const objects = overrides.flatMap((o) => convertToV4GroupNodes(o.group as Group));
		dispatch(TreeActions.isolateNodesBySharedIds(objects));
	};

	return (
		<CollectionAccordion
			title={(
				<>
					<CollectionHeadline>
						<NameContainer>
							<Name>{prefix}</Name>
						</NameContainer>
					</CollectionHeadline>
					<Buttons>
						{!readOnly && (
							<TicketButton variant="error" onClick={handleDeleteCollection}>
								<DeleteIcon />
							</TicketButton>
						)}
						<TicketButton variant="primary" onClick={isolateCollection}>
							<ShowIcon />
						</TicketButton>
					</Buttons>
					<GroupOverrideAction
						onClick={handleCheckboxClick}
						{...getCollectionCheckboxState(state)}
					/>
				</>
			)}
		>
			<GroupsContainer>
				<Groups overrides={overrides} level={level + 1} />
			</GroupsContainer>
		</CollectionAccordion>
	);
};

type GroupsProps = {
	overrides: GroupOverride[],
	level?: number,
};

export const Groups = ({ overrides, level = 0 }: GroupsProps) => {
	const [overrideItems, overrideBatches] = partition(overrides, (o) => (o.prefix?.length || 0) === level);
	const overridesByPrefix = groupBy(overrideBatches, (o) => o.prefix[level]);

	return (
		<>
			{overrideItems.map((override) => (
				<GroupItem
					override={override}
					key={override.key || (isString(override.group) ? override.group : override.group._id)}
				/>
			))}
			{Object.entries(overridesByPrefix).map(([prefix, collectionOverrides]) => (
				<GroupCollection overrides={collectionOverrides} prefix={prefix} level={level} key={prefix} />
			))}
		</>
	);
};
