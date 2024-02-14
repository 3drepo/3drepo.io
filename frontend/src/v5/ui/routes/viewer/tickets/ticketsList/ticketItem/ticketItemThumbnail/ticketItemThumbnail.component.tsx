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

import { HoverState, ImagePlaceholder, Thumbnail, ThumbnailContainer, ViewpointIcon } from '../ticketItem.styles';
import { TicketsActionsDispatchers, TicketsCardActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { hasDefaultPin } from '../../../ticketsForm/properties/coordsProperty/coordsProperty.helpers';
import { get, has } from 'lodash';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { useParams } from 'react-router-dom';
import { getTicketResourceUrl, modelIsFederation } from '@/v5/store/tickets/tickets.helpers';
import { goToView } from '@/v5/helpers/viewpoint.helpers';
import ImageIcon from '@assets/icons/outlined/image_thin-outlined.svg';
import { FormattedMessage } from 'react-intl';

export const TicketItemThumbnail = ({ ticket }) => {
	const { teamspace, project, containerOrFederation } = useParams<ViewerParams>();
	const isFederation = modelIsFederation(containerOrFederation);

	const defaultView = get(ticket.properties, 'Default View');
	const defaultImage = get(ticket.properties, 'Default Image');
	const hasViewpoint = has(defaultView, 'camera');
	
	const resourceId =  defaultView?.screenshot ||  defaultImage;
	const thumbnailSrc = resourceId ?
		getTicketResourceUrl(teamspace, project, containerOrFederation, ticket._id, resourceId, isFederation) : null;

	const goToViewpoint = (event) => {
		event.stopPropagation();

		TicketsCardActionsDispatchers.setSelectedTicket(ticket._id);
		TicketsCardActionsDispatchers.setSelectedTicketPin(hasDefaultPin(ticket) ? ticket._id : null);
		TicketsActionsDispatchers.fetchTicketGroups(teamspace, project, containerOrFederation, ticket._id);

		goToView(defaultView); 
	};

	return (
		<ThumbnailContainer>
			{hasViewpoint && (
				<HoverState onClick={goToViewpoint}>
					<ViewpointIcon />
				</HoverState>
			)}
			{thumbnailSrc ? ( <Thumbnail src={thumbnailSrc} loading="lazy" /> ) : (
				<ImagePlaceholder>
					<ImageIcon />
					<FormattedMessage id="ticketItem.thumbnail.placeholderImageText" defaultMessage="Image Unavailable" />
				</ImagePlaceholder>
			)}
		</ThumbnailContainer>
	);
};