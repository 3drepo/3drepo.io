/**
 *  Copyright (C) 2026 3D Repo Ltd
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

import { HoverPopover } from '@controls/hoverPopover/hoverPopover.component';
import { UserPopover } from '@components/shared/popoverCircles/userPopoverCircle/userPopover/userPopover.component';
import { UsersHooksSelectors } from '@/v5/services/selectorsHooks';
import { useParams } from 'react-router';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { UnknownMentionText, MentionText } from './mention.styles';
import { FormattedMessage } from 'react-intl';

type MentionProps = {
	userId: string;
};

export const Mention = ({ userId }: MentionProps) => {
	const { teamspace } = useParams<ViewerParams>();
	const user = UsersHooksSelectors.selectUser(teamspace, userId);

	if (!user || user.isNotTeamspaceMember) return <UnknownMentionText><FormattedMessage id="unknown.user" defaultMessage="Unknown user" /></UnknownMentionText>;

	return (
		<HoverPopover anchor={() => <MentionText>{user.firstName} {user.lastName}</MentionText>}>
			<UserPopover user={user} />
		</HoverPopover>
	);
};
