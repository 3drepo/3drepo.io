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

import { useContext } from 'react';
import { TicketContext } from '@/v5/ui/routes/viewer/tickets/ticket.context';
import { OverlappingContainer } from '@controls/overlappingContainer/overlappingContainer.styles';
import { InputContainer } from '@controls/inputs/inputContainer/inputContainer.styles';
import { FormattedMessage } from 'react-intl';
import { generatePath, useParams } from 'react-router-dom';
import { VIEWER_ROUTE, ViewerParams } from '@/v5/ui/routes/routes.constants';
import { TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { Overlay, Link } from './viewerInputContainer.styles';
import { NEW_TICKET_ID } from '@/v5/ui/routes/dashboard/projects/tickets/ticketsTable/ticketsTable.helper';

export const ViewerInputContainer = ({ inputRef = undefined, ...props }) => {
	const { isViewer, containerOrFederation } = useContext(TicketContext);
	const { teamspace, project } = useParams<ViewerParams>();
	
	const ticketId = TicketsCardHooksSelectors.selectSelectedTicketId();

	if (isViewer) return (<InputContainer ref={inputRef} {...props} />);

	const getOpenInViewerLink = () => {
		if (!containerOrFederation) return '/';
		const pathname = generatePath(VIEWER_ROUTE, {
			teamspace,
			project,
			containerOrFederation,
		});
		if (ticketId === NEW_TICKET_ID) return pathname;
		return pathname + `?ticketId=${ticketId}`;
	};

	return (
		<OverlappingContainer>
			<InputContainer ref={inputRef} {...props} />
			{!isViewer && (
				<Overlay>
					<FormattedMessage
						defaultMessage="Please&nbsp;<Link>Open Viewer</Link>&nbsp;to interact with this property."
						id="ticket.property.requiresViewerOverlay"
						values={{
							Link: (text) => <Link to={getOpenInViewerLink()} target="_blank">{text}</Link>,
						}}
					/>
				</Overlay>
			)}
		</OverlappingContainer>
	);
};
