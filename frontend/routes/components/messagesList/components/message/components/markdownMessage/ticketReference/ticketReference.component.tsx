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

import { PopoverProps as PopoverType } from '@material-ui/core/Popover';
import { renderWhenTrueOtherwise } from '../../../../../../../../helpers/rendering';

import { TicketPopover } from './ticketPopover/ticketPopover.component';
import { Link, Popover, Reference } from './ticketReference.styles';

interface IReferenceLink {
	isBoardView: boolean;
	onPopoverOpen: (event: React.MouseEvent<PopoverType, MouseEvent>) => void;
	onPopoverClose: () => void;
	onCardChange: () => void;
	to: string;
	children: React.ReactChild;
}

const ReferenceLink = ({ onPopoverOpen, onPopoverClose, onCardChange, children, to, ...props }: IReferenceLink) => (
	<>
		{renderWhenTrueOtherwise(
			() => (
				<Reference
					onClick={onCardChange}
					onMouseEnter={onPopoverOpen}
					onMouseLeave={onPopoverClose}
				>
					{children}
				</Reference>
			),
			() => (
				<Link
					to={to}
					aria-haspopup="true"
					onMouseEnter={onPopoverOpen}
					onMouseLeave={onPopoverClose}
				>
					{children}
				</Link>
			),
		)(props.isBoardView)}
	</>
);

interface IProps {
	id: number;
	text: string;
	issues: any[];
	urlParams: any;
	fetchCardData: (boardType, teamspace, modelId, cardId) => void;
	resetCardData: () => void;
}

export const TicketReference = ({ id, text, issues, urlParams, ...props }: IProps) => {
	const [anchorEl, setAnchorEl] = React.useState<PopoverType | null>(null);
	const issueData = issues.find(({ _id }) => id === _id );
	const { teamspace, type } = urlParams;
	const isBoardView = Boolean(type);

	if (!issueData) {
		return text;
	}

	const { _id: issueId, model, number: issueNumber, name, desc, statusColor, StatusIconComponent } = issueData;

	const handlePopoverOpen = (event: React.MouseEvent<PopoverType, MouseEvent>) => setAnchorEl(event.currentTarget);

	const handlePopoverClose = () => setAnchorEl(null);

	const handleCardChange = () => {
		props.resetCardData();
		props.fetchCardData(type, teamspace, model, issueId);
	};

	return (
		<>
			<ReferenceLink
				to={`/viewer/${teamspace}/${model}?issueId=${issueId}`}
				onPopoverOpen={handlePopoverOpen}
				onPopoverClose={handlePopoverClose}
				onCardChange={handleCardChange}
				isBoardView={isBoardView}
			>
				{text}
			</ReferenceLink>
			<Popover
				id="mouse-over-popover"
				open={Boolean(anchorEl)}
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
				<TicketPopover
					name={name}
					desc={desc}
					number={issueNumber}
					StatusIconComponent={StatusIconComponent}
					statusColor={statusColor}
				/>
			</Popover>
		</>
	);
};
