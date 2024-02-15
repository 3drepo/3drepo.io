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

import { formatLongDateTime, formatShortDateTime, getRelativeTime } from '@/v5/helpers/intl.helper';
import { TeamspacesHooksSelectors, UsersHooksSelectors } from '@/v5/services/selectorsHooks';
import { HoverPopover } from '@controls/hoverPopover/hoverPopover.component';
import { FormattedMessage } from 'react-intl';
import { UserPopover } from '../popoverCircles/userPopoverCircle/userPopover/userPopover.component';
import { PopoverContainer } from '../popoverCircles/userPopoverCircle/userPopover/userPopover.styles';
import { CreationInfoContainer, CreationInfoValue, TruncateName } from './creationInfo.styles';

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

	const Username = () => (
		<HoverPopover anchor={(props) => <TruncateName {...props}>{`${ownerDetails.firstName} ${ownerDetails.lastName}`}</TruncateName>}>
			<UserPopover user={ownerDetails} />
		</HoverPopover>
	);
	const CreationDate = () => (
		<HoverPopover anchor={(props) => <CreationInfoValue {...props}>{formatShortDateTime(createdAt)}</CreationInfoValue>}>
			<PopoverContainer>
				{formatLongDateTime(createdAt)}
			</PopoverContainer>
		</HoverPopover>
	);
	const LastUpdated = () => (
		<HoverPopover anchor={(props) => <CreationInfoValue {...props}>{getRelativeTime(updatedAt)}</CreationInfoValue>}>
			<PopoverContainer>
				{formatLongDateTime(updatedAt)}
			</PopoverContainer>
		</HoverPopover>
	);
	return (
		<CreationInfoContainer className={className}>
			<FormattedMessage
				id="creationInfo.creation"
				defaultMessage="Created by {username} on {creationDate}"
				values={{ username: <Username />, creationDate: <CreationDate /> }}
			/>
			{updatedAt && updatedAt !== createdAt && (
				<FormattedMessage
					id="creationInfo.lastUpdated"
					defaultMessage=". Updated {lastUpdated}"
					values={{ lastUpdated: <LastUpdated /> }}
				/>
			)}
		</CreationInfoContainer>
	);
};
