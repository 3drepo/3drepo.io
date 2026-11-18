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
import { ReactNode, useState } from 'react';
import { renderWhenTrueOtherwise } from '../../../../../../../../helpers/rendering';

import { TicketPopover } from './ticketPopover/ticketPopover.component';
import { Link, Popover, Reference } from './ticketReference.styles';

interface IReferenceLink {
	isBoardView: boolean;
	onPopoverOpen: (event: React.MouseEvent<any, MouseEvent>) => void;
	onPopoverClose: () => void;
	onCardChange: () => void;
	to: string;
	children: ReactNode;
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
	issuesMap: object;
	urlParams: any;
	fetchCardData: (teamspace, modelId, cardId) => void;
	resetCardData: () => void;
}

export const TicketReference = ({ id, text, issuesMap, urlParams, ...props }: IProps) => {
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const { teamspace } = urlParams;

	if (!issuesMap[id]) {
		return <>{text}</>;
	}

	const { _id: ticketId, model, number: ticketNumber, name, desc, statusColor, StatusIconComponent } = issuesMap[id];

	const handlePopoverOpen = (event: React.MouseEvent<any, MouseEvent>) => setAnchorEl(event.currentTarget);

	const handlePopoverClose = () => setAnchorEl(null);

	const handleCardChange = () => {
		props.resetCardData();
		props.fetchCardData(teamspace, model, ticketId);
	};

	return (
		<>
			<ReferenceLink
				to={`/viewer/${teamspace}/${model}?issueId=${ticketId}`}
				onPopoverOpen={handlePopoverOpen}
				onPopoverClose={handlePopoverClose}
				onCardChange={handleCardChange}
				isBoardView
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
					number={ticketNumber}
					StatusIconComponent={StatusIconComponent}
					statusColor={statusColor}
				/>
			</Popover>
		</>
	);
};
