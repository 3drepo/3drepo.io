/**
 *  Copyright (C) 2021 3D Repo Ltd
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
import { FixedOrGrowContainer, FixedOrGrowContainerProps } from '@controls/fixedOrGrowContainer';
import { TeamspacesHooksSelectors, UsersHooksSelectors } from '@/v5/services/selectorsHooks';
import { IUser } from '@/v5/store/users/users.redux';
import { HoverPopover } from '@controls/hoverPopover/hoverPopover.component';
import { UserPopover } from '@components/shared/popoverCircles/userPopoverCircle/userPopover/userPopover.component';
import { Name } from './revisionsListItemAuthor.styles';

import type { JSX } from "react";

interface IRevisionsListItemAuthor extends FixedOrGrowContainerProps {
	authorName: string;
}

export const RevisionsListItemAuthor = ({ authorName, ...containerProps }: IRevisionsListItemAuthor): JSX.Element => {
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const author: IUser = UsersHooksSelectors.selectUser(teamspace, authorName);
	const authorFullName = [author.firstName, author.lastName].join(' ');
	return (
		<FixedOrGrowContainer {...containerProps}>
			<HoverPopover anchor={(props) => <Name aria-haspopup="true" {...props}>{authorFullName}</Name>}>
				<UserPopover user={author} />
			</HoverPopover>
		</FixedOrGrowContainer>
	);
};
