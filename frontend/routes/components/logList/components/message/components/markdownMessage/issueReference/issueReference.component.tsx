/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import { Truncate } from '../../../../../../truncate/truncate.component';
import { Container, Description, Header, Icon, IssueNumber, Link, Popover, Title } from './issueReference.styles';

export const IssueReference = ({ id, text, issues, teamspace }) => {
	const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
	const open = Boolean(anchorEl);
	const issueData = issues[id];

	if (!issueData) {
		return text;
	}

	const { _id: issueId, model, number: issueNumber, name, desc, StatusIconComponent, ...props } = issueData;

	const handlePopoverOpen = (
			event: React.MouseEvent<HTMLElement, MouseEvent>
	) => {
		setAnchorEl(event.currentTarget);
	};

	const handlePopoverClose = () => {
		setAnchorEl(null);
	};

	return (
		<>
			<Link
				to={`/viewer/${teamspace}/${model}?issueId=${issueId}`}
				aria-haspopup="true"
				onMouseEnter={handlePopoverOpen}
				onMouseLeave={handlePopoverClose}
			>
				{text}
			</Link>
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
				<Container>
					<Header>
						<Icon>
							<StatusIconComponent color="inherit" fontSize="inherit" />
						</Icon>
						<Title>{name} <IssueNumber>(#{issueNumber})</IssueNumber></Title>
					</Header>
					<Description>
						<Truncate lines={1}>
							{desc}
						</Truncate>
					</Description>
				</Container>
			</Popover>
		</>
	);
};
