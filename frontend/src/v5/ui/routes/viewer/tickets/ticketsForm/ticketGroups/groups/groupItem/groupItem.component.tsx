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
import HideIcon from '@assets/icons/outlined/eye_disabled-outlined.svg';
import DeleteIcon from '@assets/icons/outlined/delete-outlined.svg';
import { ViewpointGroup, ViewpointGroupHierarchy } from '@/v5/store/tickets/tickets.types';
import { useContext, useState } from 'react';
import { DialogsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { formatMessage } from '@/v5/services/intl';
import { rgbaToHex } from '@/v4/helpers/colors';
import { FormattedMessage } from 'react-intl';
import { GroupIconComponent } from '@/v5/ui/routes/viewer/groups/groupItem/groupIcon/groupIcon.component';
import { ErrorTicketButton, PrimaryTicketButton } from '@/v5/ui/routes/viewer/tickets/ticketButton/ticketButton.styles';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { CircularProgress } from '@mui/material';
import { isString } from 'lodash';
import {
	Buttons,
	NameContainer,
	Container,
	Headline,
	Name,
	GroupsCount,
} from './groupItem.styles';
import { GroupToggle } from '../../groupToggle/groupToggle.component';
import { TicketGroupsContext } from '../../ticketGroupsContext';
import { EditGroupButton } from '../groupActionMenu/editGroupButton/editGroupButton.component';

type GroupProps = ViewpointGroupHierarchy & {
	currentPrefix: string[],
};
export const GroupItem = ({ group, color, opacity, currentPrefix }: GroupProps) => {
	const [groupIsVisible, setGroupIsVisible] = useState(false);
	const { groupType } = useContext(TicketGroupsContext);
	const isAdmin = ProjectsHooksSelectors.selectIsProjectAdmin();

	const deleteGroup = () => {
		DialogsActionsDispatchers.open('delete', {
			name: (group as ViewpointGroup).name,
			message: formatMessage({
				id: 'deleteModal.groups.message',
				defaultMessage: 'By deleting this Collection your data will be lost permanently and will not be recoverable.',
			}),
			onClickConfirm: () => {},
			confirmLabel: formatMessage({ id: 'deleteModal.groups.confirmButton', defaultMessage: 'Delete Collection' }),
		});
	};

	const toggleShowGroup = () => {
		setGroupIsVisible(!groupIsVisible);
	};

	const alphaColor = (color || [255, 255, 255]).concat(opacity);
	const alphaHexColor = rgbaToHex(alphaColor.join());

	if (isString(group)) return (<CircularProgress />);

	return (
		<Container>
			<Headline>
				<GroupIconComponent rules={group.rules} color={alphaHexColor} />
				<NameContainer>
					<Name>{group.name}</Name>
					<GroupsCount>
						<FormattedMessage
							id="groups.item.numberOfMeshes"
							defaultMessage="{count, plural, =0 {No objects} one {# object} other {# objects}}"
							// TODO - fix with actual mesh count when logic is implemented
							values={{ count: group.objects.length }}
						/>
					</GroupsCount>
				</NameContainer>
				{groupType === 'colored' && (
					<Buttons>
						{isAdmin && (
							<ErrorTicketButton onClick={deleteGroup}>
								<DeleteIcon />
							</ErrorTicketButton>
						)}
						<PrimaryTicketButton onClick={toggleShowGroup}>
							{groupIsVisible ? (<ShowIcon />) : (<HideIcon />)}
						</PrimaryTicketButton>
						<EditGroupButton defaultValues={{ color, opacity, ...group, prefix: currentPrefix }} />
					</Buttons>
				)}
			</Headline>
			<GroupToggle />
		</Container>
	);
};
