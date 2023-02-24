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
import { useParams } from 'react-router';

import { FixedOrGrowContainerProps } from '@controls/fixedOrGrowContainer';
import { UserPopover } from '@components/shared/userPopover/userPopover.component';
import { UsersHooksSelectors } from '@/v5/services/selectorsHooks';
import { IUser } from '@/v5/store/users/users.redux';
import { DashboardParams } from '@/v5/ui/routes/routes.constants';
import { HoverPopover } from '@controls/hoverPopover/hoverPopover.component';
import { Text, Name, FixedOrGrowContainer } from './revisionsListItemAuthor.styles';

interface IRevisionsListItemAuthor extends FixedOrGrowContainerProps {
	authorName: string;
	active?: boolean;
}

export const RevisionsListItemAuthor = ({
	authorName,
	active = false,
	...rest
}: IRevisionsListItemAuthor): JSX.Element => {
	const { teamspace } = useParams<DashboardParams>();
	const author: IUser = UsersHooksSelectors.selectUser(teamspace, authorName);

	return (
		<FixedOrGrowContainer {...rest} $active={active}>
			<HoverPopover
				anchor={(props) => (
					<Text
						aria-haspopup="true"
						$active={active}
						{...props}
					>
						<Name>{author.firstName}</Name>
						<Name>{author.lastName}</Name>
					</Text>
				)}
			>
				<UserPopover user={author} />
			</HoverPopover>
		</FixedOrGrowContainer>
	);
};
