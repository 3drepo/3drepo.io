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
import { ITicketComment } from '@/v5/store/tickets/comments/ticketComments.types';
import { pick } from 'lodash';
import api from './default';

export const fetchFederationComments = async (
	teamspace: string,
	projectId: string,
	federationId: string,
	ticketId: string,
): Promise<FetchCommentsResponse> => {
	const { data } = await api.get(
		`teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}/tickets/${ticketId}/comments`,
	);
	return data;
};

export const fetchContainerComments = async (
	teamspace: string,
	projectId: string,
	containerId: string,
	ticketId: string,
): Promise<FetchCommentsResponse> => {
	const { data } = await api.get(
		`teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}/tickets/${ticketId}/comments`,
	);
	return data;
};

export const fetchFederationComment = async (
	teamspace: string,
	projectId: string,
	federationId: string,
	ticketId: string,
	commentId: string,
): Promise<Partial<ITicketComment>> => {
	const { data } = await api.get(
		`teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}/tickets/${ticketId}/comments/${commentId}`,
	);
	return data;
};

export const fetchContainerComment = async (
	teamspace: string,
	projectId: string,
	containerId: string,
	ticketId: string,
	commentId: string,
): Promise<Partial<ITicketComment>> => {
	const { data } = await api.get(
		`teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}/tickets/${ticketId}/comments/${commentId}`,
	);
	return data;
};

export const createFederationComment = async (
	teamspace: string,
	projectId: string,
	federationId: string,
	ticketId: string,
	comment: Partial<ITicketComment>,
): Promise<CreateCommentsResponse> => {
	const { data } = await api.post(
		`teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}/tickets/${ticketId}/comments`,
		pick(comment, ['message', 'images', 'views']),
	);
	return data;
};

export const createContainerComment = async (
	teamspace: string,
	projectId: string,
	containerId: string,
	ticketId: string,
	comment: Partial<ITicketComment>,
): Promise<CreateCommentsResponse> => {
	const { data } = await api.post(
		`teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}/tickets/${ticketId}/comments`,
		pick(comment, ['message', 'images', 'views']),
	);
	return data;
};

export const deleteFederationComment = async (
	teamspace: string,
	projectId: string,
	federationId: string,
	ticketId: string,
	commentId: string,
) => (
	api.delete(`teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}/tickets/${ticketId}/comments/${commentId}`)
);

export const deleteContainerComment = async (
	teamspace: string,
	projectId: string,
	containerId: string,
	ticketId: string,
	commentId: string,
) => (
	api.delete(`teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}/tickets/${ticketId}/comments/${commentId}`)
);

export const updateFederationComment = async (
	teamspace: string,
	projectId: string,
	federationId: string,
	ticketId: string,
	commentId: string,
	comment: Partial<ITicketComment>,
) => (
	api.put(
		`teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}/tickets/${ticketId}/comments/${commentId}`,
		pick(comment, ['message', 'images']),
	)
);

export const updateContainerComment = async (
	teamspace: string,
	projectId: string,
	containerId: string,
	ticketId: string,
	commentId: string,
	comment: Partial<ITicketComment>,
) => (
	api.put(
		`teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}/tickets/${ticketId}/comments/${commentId}`,
		pick(comment, ['message', 'images']),
	)
);

/**
 * Types
 */
type FetchCommentsResponse = { comments: Partial<ITicketComment>[] };
type CreateCommentsResponse = { _id: string };
