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

import { formatDateTime, getRelativeTime } from '@/v5/helpers/intl.helper';
import { TeamspacesHooksSelectors, UsersHooksSelectors } from '@/v5/services/selectorsHooks';
import { HoverPopover } from '@controls/hoverPopover/hoverPopover.component';
import { FormattedMessage } from 'react-intl';
import { UserPopover } from '../popoverCircles/userPopoverCircle/userPopover/userPopover.component';
import { PopoverContainer } from '../popoverCircles/userPopoverCircle/userPopover/userPopover.styles';
import { CreationInfoContainer, NoShrinkLabel, ShrinkValue, NoShrinkValue } from './creationInfo.styles';

type ICreationInfo = {
	owner: string;
	createdAt: number;
	updatedAt?: number;
	className?: string;
};

export const CreationInfo = ({
	owner,
	createdAt,
	updatedAt,
	className,
}: ICreationInfo) => {
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const ownerDetails = UsersHooksSelectors.selectUser(teamspace, owner);
	const hasUpdateInfo = updatedAt && updatedAt !== createdAt;

	const Username = () => (
		<ShrinkValue>
			<HoverPopover anchor={(props) => <span {...props}>{owner}</span>}>
				<UserPopover user={ownerDetails} />
			</HoverPopover>
		</ShrinkValue>
	);
	const CreationDate = () => (
		<NoShrinkValue>
			{formatDateTime(createdAt)}
			{hasUpdateInfo && <FormattedMessage id="creationInfo.fullStop" defaultMessage="." />}
		</NoShrinkValue>
	);
	const LastUpdated = () => (
		<NoShrinkValue>
			<HoverPopover anchor={(props) => <span {...props}>{getRelativeTime(updatedAt)}</span>}>
				<PopoverContainer>
					{formatDateTime(updatedAt)}
				</PopoverContainer>
			</HoverPopover>
		</NoShrinkValue>
	);
	return (
		<CreationInfoContainer className={className}>
			<NoShrinkLabel><FormattedMessage id="creationInfo.createdBy" defaultMessage="Created by" /></NoShrinkLabel>
			<Username />
			<NoShrinkLabel><FormattedMessage id="creationInfo.on" defaultMessage="on" /></NoShrinkLabel>
			<CreationDate />
			{hasUpdateInfo && (
				<>
					<NoShrinkLabel><FormattedMessage id="creationInfo.updatedAt" defaultMessage="Updated" /></NoShrinkLabel>
					<LastUpdated />
				</>
			)}
		</CreationInfoContainer>
	);
};
