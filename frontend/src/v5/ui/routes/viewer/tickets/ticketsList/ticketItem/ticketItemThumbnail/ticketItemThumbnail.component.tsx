/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { ViewpointOverlay, ThumbnailContainer, ViewpointIcon } from './ticketItemThumbnail.styles';
import { get, has } from 'lodash';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { useParams } from 'react-router-dom';
import { getTicketResourceUrl, modelIsFederation } from '@/v5/store/tickets/tickets.helpers';
import { AdditionalProperties } from '../../../tickets.constants';
import { ITicket } from '@/v5/store/tickets/tickets.types';
import { Thumbnail } from '@controls/thumbnail/thumbnail.component';
import { TicketsActionsDispatchers } from '@/v5/services/actionsDispatchers';

type ITicketItemThumbnail = {
	ticket: ITicket;
	selectTicket: (e) => void;
};

export const TicketItemThumbnail = ({ ticket, selectTicket }: ITicketItemThumbnail) => {
	const { teamspace, project, containerOrFederation, revision } = useParams<ViewerParams>();
	const isFederation = modelIsFederation(containerOrFederation);

	const defaultView = get(ticket.properties, AdditionalProperties.DEFAULT_VIEW);
	const hasViewpoint = has(defaultView, 'camera');
	
	const resourceId =  defaultView?.screenshot ||  get(ticket.properties, AdditionalProperties.DEFAULT_IMAGE);
	const thumbnailSrc = resourceId ?
		getTicketResourceUrl(teamspace, project, containerOrFederation, ticket._id, resourceId, isFederation) : null;

	const goToViewpoint = async (event) => {
		selectTicket(event);
		TicketsActionsDispatchers.fetchTicketGroupsAndGoToView(teamspace, project, containerOrFederation, ticket._id, revision);
	};

	return (
		<ThumbnailContainer onClick={goToViewpoint}>
			<Thumbnail src={thumbnailSrc} />
			{hasViewpoint && (
				<ViewpointOverlay>
					<ViewpointIcon />
				</ViewpointOverlay>
			)}
		</ThumbnailContainer>
	);
};