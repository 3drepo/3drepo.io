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

import React from 'react';
import { useParams } from 'react-router';

import { FixedOrGrowContainer } from '@controls/fixedOrGrowContainer';
import { IUser } from '@/v5/store/teamspaces/teamspaces.redux';
import { Popover } from '@/v4/routes/components/messagesList/components/message/components/markdownMessage/ticketReference/ticketReference.styles';
import { UserPopover } from '@components/shared/userPopover/userPopover.component';
import { TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks/teamspacesSelectors.hooks';
import { Text } from './revisionsListItemAuthor.styles';

type IRevisionsListItemAuthor = {
	width?: number;
	className?: string;
	authorName: string;
	active?: boolean;
};

export const RevisionsListItemAuthor = ({
	width,
	className,
	authorName,
	active = false,
}: IRevisionsListItemAuthor): JSX.Element => {
	const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
	const { teamspace } = useParams();
	const teamspaceUsers: IUser[] = TeamspacesHooksSelectors.selectTeamspaceUsers(teamspace);

	const author = teamspaceUsers.find(({ user }) => user === authorName);

	const handlePopoverOpen = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
		setAnchorEl(event.currentTarget);
	};

	const handlePopoverClose = () => {
		setAnchorEl(null);
	};

	const open = Boolean(anchorEl);

	return (
		<FixedOrGrowContainer width={width} className={className}>
			<Text
				aria-owns={open ? 'mouse-over-popover' : undefined}
				aria-haspopup="true"
				onMouseEnter={handlePopoverOpen}
				onMouseLeave={handlePopoverClose}
				$active={active}
			>
				{author.firstName} {author.lastName}
			</Text>
			<Popover
				id="mouse-over-popover"
				open={open}
				anchorEl={anchorEl}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'center',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'left',
				}}
				onClose={handlePopoverClose}
				disableRestoreFocus
			>
				<UserPopover user={author} />
			</Popover>
		</FixedOrGrowContainer>
	);
};
