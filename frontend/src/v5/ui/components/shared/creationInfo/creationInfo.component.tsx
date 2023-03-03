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

import { getRelativeTime } from '@/v5/helpers/intl.helper';
import { formatDate } from '@/v5/services/intl';
import { TeamspacesHooksSelectors, UsersHooksSelectors } from '@/v5/services/selectorsHooks';
import { UserPopover } from '@components/shared/userPopover/userPopover.component';
import { PopoverContainer } from '@components/shared/userPopover/userPopover.styles';
import { HoverPopover } from '@controls/hoverPopover/hoverPopover.component';
import { FormattedMessage } from 'react-intl';
import { CreationInfoContainer, TruncateName } from './creationInfo.styles';

type ICreationInfo = {
	owner: string;
	createdAt: number;
	updatedAt?: number;
};

export const CreationInfo = ({
	owner,
	createdAt,
	updatedAt,
}: ICreationInfo) => {
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const ownerDetails = UsersHooksSelectors.selectUser(teamspace, owner);
	const Username = () => (
		<HoverPopover anchor={(props) => <TruncateName {...props}>{owner}</TruncateName>}>
			<UserPopover user={ownerDetails} />
		</HoverPopover>
	);
	const LastUpdated = () => (
		<HoverPopover anchor={(props) => <span {...props}>{getRelativeTime(updatedAt)}</span>}>
			<PopoverContainer>
				{formatDate(updatedAt, {
					hour: 'numeric',
					minute: 'numeric',
					day: 'numeric',
					month: 'long',
					year: 'numeric',
				})}
			</PopoverContainer>
		</HoverPopover>
	);
	return (
		<CreationInfoContainer>
			<span>
				<FormattedMessage
					id="creationInfo.creation"
					defaultMessage="Created by {username} on {creationDate}."
					values={{ username: <Username />, creationDate: formatDate(createdAt) }}
				/>
			</span>
			{updatedAt && (
				<span>
					<FormattedMessage
						id="creationInfo.lastUpdated"
						defaultMessage="Updated {lastUpdated}."
						values={{ lastUpdated: <LastUpdated /> }}
					/>
				</span>
			)}
		</CreationInfoContainer>
	);
};
