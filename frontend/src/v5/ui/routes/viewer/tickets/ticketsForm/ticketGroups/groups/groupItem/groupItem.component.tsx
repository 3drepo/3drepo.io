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

import ShowIcon from '@assets/icons/outlined/eye-outlined.svg';
import DeleteIcon from '@assets/icons/outlined/delete-outlined.svg';
import { Group, GroupOverride, OverrideType } from '@/v5/store/tickets/tickets.types';
import { useContext, useEffect } from 'react';
import { DialogsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { formatMessage } from '@/v5/services/intl';
import { FormattedMessage } from 'react-intl';
import { GroupIconComponent } from '@/v5/ui/routes/viewer/groups/groupItem/groupIcon/groupIcon.component';
import { TicketButton } from '@/v5/ui/routes/viewer/tickets/ticketButton/ticketButton.styles';
import { TemplatesPermissionsHooksSelectors, TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { CircularProgress, Tooltip } from '@mui/material';
import { isString } from 'lodash';
import EditIcon from '@assets/icons/outlined/edit-outlined.svg';
import { convertToV4GroupNodes } from '@/v5/helpers/viewpoint.helpers';
import { TreeActions, selectNumNodesByMeshSharedIdsArray } from '@/v4/modules/tree';
import { useDispatch, useSelector } from 'react-redux';
import {
	Buttons,
	NameContainer,
	Container,
	Headline,
	Name,
	GroupsCount,
} from './groupItem.styles';
import { GroupOverrideAction } from '../../groupOverrideAction/groupOverrideAction.component';
import { TicketGroupsContext } from '../../ticketGroupsContext';
import { RgbArray, rgbToHex } from '@/v5/helpers/colors.helper';
import { TicketContext } from '../../../../ticket.context';

type GroupProps = { override: GroupOverride };
export const GroupItem = ({ override }: GroupProps) => {
	const dispatch = useDispatch();
	const {
		groupType,
		highlightedKey,
		setHighlightedKey,
		clearHighlightedKey,
		getGroupIsChecked,
		setGroupIsChecked,
		deleteGroup,
		editGroup,
	} = useContext(TicketGroupsContext);
	const { containerOrFederation } = useContext(TicketContext);
	const templateId = TicketsCardHooksSelectors.selectSelectedTemplateId();
	const readOnly = !TemplatesPermissionsHooksSelectors.selectHasDefaultEditPermissionForTemplate(containerOrFederation, templateId);
	const { group, color, opacity, key } = override;
	const checked = getGroupIsChecked(key);

	const isHidden = groupType === OverrideType.HIDDEN;
	const isHighlighted = highlightedKey === key;

	const sharedIds = convertToV4GroupNodes(group as Group).flatMap(({ shared_ids }) => shared_ids);
	const objectsCount = useSelector((state) => selectNumNodesByMeshSharedIdsArray(state, sharedIds));

	const preventPropagation = (e) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDeleteGroup = (e) => {
		preventPropagation(e);
		DialogsActionsDispatchers.open('delete', {
			name: (group as Group).name,
			message: formatMessage({
				id: 'deleteModal.groups.message',
				defaultMessage: 'By deleting this group your data will be lost permanently and will not be recoverable.',
			}),
			onClickConfirm: () => deleteGroup(key),
			confirmLabel: formatMessage({ id: 'deleteModal.groups.confirmButton', defaultMessage: 'Delete Group' }),
		});
	};

	const handleClick = (e) => {
		preventPropagation(e);
		setHighlightedKey(key);
	};

	const isolateGroup = (e) => {
		preventPropagation(e);
		const objects = convertToV4GroupNodes(group as Group);
		dispatch(TreeActions.isolateNodesBySharedIds(objects));
	};

	const onEditGroup = () => editGroup(key);

	const handleToggleClick = (e) => {
		preventPropagation(e);
		if (groupType === OverrideType.SELECTED) {
			setHighlightedKey(key);
			return;
		}
		setGroupIsChecked(key, !checked);
		if (isHidden && !checked && isHighlighted) {
			clearHighlightedKey();
		}
	};

	const handleGroupAction = (e) => {
		preventPropagation(e);
		const objects = convertToV4GroupNodes(group as Group);
		if (groupType === OverrideType.HIDDEN) {
			dispatch(TreeActions.hideNodesBySharedIds(objects));
		} else if (groupType === OverrideType.SHOWN) {
			dispatch(TreeActions.isolateNodesBySharedIds(objects));
		} else {
			handleToggleClick(e);
		}
	};

	const alphaColor = (color || [255, 255, 255]).concat(opacity) as RgbArray;
	const alphaHexColor = rgbToHex(alphaColor);

	const highlightGroupObjects = () => {
		const objects = convertToV4GroupNodes(group as Group);
		dispatch(TreeActions.clearCurrentlySelected());
		dispatch(TreeActions.showNodesBySharedIds(objects));
		const selectionColor = isHidden ? [255, 255, 255] : color;
		dispatch(TreeActions.selectNodesBySharedIds(objects, selectionColor?.map((c) => c / 255)));
	};

	useEffect(() => {
		if (!isHighlighted && isHidden && checked) {
			const objects = convertToV4GroupNodes(group as Group);
			dispatch(TreeActions.hideNodesBySharedIds(objects));
		}

		if (isHighlighted) {
			highlightGroupObjects();
		}
	}, [isHighlighted]);

	if (isString(group)) return (<CircularProgress />);

	return (
		<Container onClick={handleClick} $highlighted={isHighlighted}>
			<Headline>
				<GroupIconComponent rules={group.rules} color={alphaHexColor} />
				<NameContainer>
					<Name>{group.name}</Name>
					<GroupsCount>
						<FormattedMessage
							id="groups.item.numberOfMeshes"
							defaultMessage="{count, plural, =0 {No objects} one {# object} other {# objects}}"
							values={{ count: objectsCount }}
						/>
					</GroupsCount>
				</NameContainer>
				<Buttons>
					{!readOnly && (
						<TicketButton variant="error" onClick={handleDeleteGroup}>
							<DeleteIcon />
						</TicketButton>
					)}
					<TicketButton variant="primary" onClick={isolateGroup}>
						<ShowIcon />
					</TicketButton>
					<Tooltip title={formatMessage({ id: 'ticketCard.groups.editGroupTooltip', defaultMessage: 'Edit Group not available for exclude specified objects' })}
						open={group.excludeDefinedObjects ? undefined : false}>
						<TicketButton variant="primary" onClick={onEditGroup} disabled={group.excludeDefinedObjects}>
							<EditIcon />
						</TicketButton>
					</Tooltip>
				</Buttons>
			</Headline>
			<GroupOverrideAction
				checked={checked}
				onClick={handleGroupAction}
			/>
		</Container>
	);
};
