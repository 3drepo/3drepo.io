/**
 *  Copyright (C) 2022 3D Repo Ltd
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
import { ITicket, ITemplate, NewTicket, IComment } from '@/v5/store/tickets/tickets.types';
// import { pick } from 'lodash';
import api from './default';

export const fetchContainerTemplates = async (
	teamspace: string,
	projectId: string,
	containerId: string,
): Promise<FetchTemplatesResponse> => {
	const { data } = await api.get(`teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}/tickets/templates`);
	return data.templates;
};

export const fetchContainerTemplate = async (
	teamspace: string,
	projectId: string,
	containerId: string,
	templateId:string,
): Promise<ITemplate> => {
	const { data } = await api.get(`teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}/tickets/templates/${templateId}`);
	return data;
};

export const fetchFederationTemplates = async (
	teamspace: string,
	projectId: string,
	federationId: string,
): Promise<FetchTemplatesResponse> => {
	const { data } = await api.get(`teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}/tickets/templates`);
	return data.templates;
};

export const fetchFederationTemplate = async (
	teamspace: string,
	projectId: string,
	federationId: string,
	templateId:string,
): Promise<ITemplate> => {
	const { data } = await api.get(`teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}/tickets/templates/${templateId}`);
	return data;
};

export const fetchContainerTickets = async (
	teamspace: string,
	projectId: string,
	containerId: string,
): Promise<FetchTicketsResponse> => {
	const { data } = await api.get(`teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}/tickets`);
	return data.tickets;
};

export const fetchFederationTickets = async (
	teamspace: string,
	projectId: string,
	federationId: string,
): Promise<FetchTicketsResponse> => {
	const { data } = await api.get(`teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}/tickets`);
	return data.tickets;
};

export const fetchContainerTicket = async (
	teamspace: string,
	projectId: string,
	containerId: string,
	ticketId: string,
): Promise<ITicket> => {
	const { data } = await api.get(`teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}/tickets/${ticketId}`);
	return data;
};

export const fetchFederationTicket = async (
	teamspace: string,
	projectId: string,
	federationId: string,
	ticketId: string,
): Promise<ITicket> => {
	const { data } = await api.get(`teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}/tickets/${ticketId}`);
	return data;
};

export const createContainerTicket = async (
	teamspace: string,
	projectId: string,
	containterId: string,
	ticket: NewTicket,
): Promise<CreateTicketResponse> => {
	const { data } = await api.post(`teamspaces/${teamspace}/projects/${projectId}/containers/${containterId}/tickets`, ticket);
	return data;
};

export const createFederationTicket = async (
	teamspace: string,
	projectId: string,
	federationId: string,
	ticket: NewTicket,
): Promise<CreateTicketResponse> => {
	const { data } = await api.post(`teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}/tickets`, ticket);
	return data;
};

export const updateContainerTicket = async (
	teamspace: string,
	projectId: string,
	containerId: string,
	ticketId: string,
	ticket: Partial<ITicket>,
) => (
	api.patch(`teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}/tickets/${ticketId}`, ticket)
);

export const updateFederationTicket = async (
	teamspace: string,
	projectId: string,
	federationId: string,
	ticketId: string,
	ticket: Partial<ITicket>,
) => (
	api.patch(`teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}/tickets/${ticketId}`, ticket)
);

export const fetchRiskCategories = async (
	teamspace: string,
): Promise<FetchRiskCategoriesResponse> => {
	const { data } = await api.get(`teamspaces/${teamspace}/settings/tickets/riskCategories`);
	return data;
};

export const fetchFederationTicketComments = async (
	teamspace: string,
	projectId: string,
	federationId: string,
	ticketId: string,
) => {
	// const { data } = await api.get(
		// `/teamspaces/${teamspace}/projects/${projectId}/federation/${federationId}/tickets/${ticketId}/comments`,
	// );
	// return data;
	return MOCK_COMMENTS;
};

export const fetchContainerTicketComments = async (
	teamspace: string,
	projectId: string,
	containerId: string,
	ticketId: string,
) => {
	// const { data } = await api.get(
		// `/teamspaces/${teamspace}/projects/${projectId}/container/${containerId}/tickets/${ticketId}/comments`,
	// );
	// return data;
	return MOCK_COMMENTS;
};

export const createFederationTicketComment = async (
	teamspace: string,
	projectId: string,
	federationId: string,
	ticketId: string,
	comment: IComment,
) => {
	// const { data } = await api.post(
		// `/teamspaces/${teamspace}/projects/${projectId}/federation/${federationId}/tickets/${ticketId}/comments/${comment._id}`,
		// pick(comment, ['comment', 'images']),
	// );
	// return data;
	return new Date().toString();
};

export const createContainerTicketComment = async (
	teamspace: string,
	projectId: string,
	containerId: string,
	ticketId: string,
	comment: IComment,
) => {
	// const { data } = await api.post(
		// `/teamspaces/${teamspace}/projects/${projectId}/container/${containerId}/tickets/${ticketId}/comments/${comment._id}`,
		// pick(comment, ['comment', 'images']),
	// );
	// return data;
	return new Date().toString();
};

export const deleteFederationTicketComment = async (
	teamspace: string,
	projectId: string,
	federationId: string,
	ticketId: string,
	commentId: string,
) => {
	// const { data } = await api.delete(
		// `/teamspaces/${teamspace}/projects/${projectId}/federation/${federationId}/tickets/${ticketId}/comments/${commentId}`,
	// );
};

export const deleteContainerTicketComment = async (
	teamspace: string,
	projectId: string,
	containerId: string,
	ticketId: string,
	commentId: string,
) => {
	// const { data } = await api.delete(
		// `/teamspaces/${teamspace}/projects/${projectId}/container/${containerId}/tickets/${ticketId}/comments/${commentId}`,
	// );
};

export const updateFederationTicketComment = async (
	teamspace: string,
	projectId: string,
	federationId: string,
	ticketId: string,
	comment: Partial<IComment>,
) => {
	// const { data } = await api.put(
		// `/teamspaces/${teamspace}/projects/${projectId}/federation/${federationId}/tickets/${ticketId}/comments/${comment._id}`,
		// pick(comment, ['comment', 'images']),
	// );
};

export const updateContainerTicketComment = async (
	teamspace: string,
	projectId: string,
	containerId: string,
	ticketId: string,
	comment: Partial<IComment>,
) => {
	// const { data } = await api.put(
		// `/teamspaces/${teamspace}/projects/${projectId}/container/${containerId}/tickets/${ticketId}/comments/${comment._id}`,
		// pick(comment, ['comment', 'images']),
	// );
};

const MOCK_COMMENTS = [
	{
		// teamspace: 'localuser1',
		author: 'localuser1',
		comment: `[author]:- "localuser1"\n[_id]:- "1"\n[comment]:- "original"\n\nreply`,
		createdAt: new Date('1 1 2022'),
		deleted: false,
	},
	{
		// teamspace: 'localuser1',
		author: 'localuser2',
		comment: `[author]:- "localuser1"\n[_id]:- "2"\n[comment]:- "comment by current user"\n\nreply by other user`,
		createdAt: new Date('1 1 2022'),
		deleted: false,
	},
].map((x, index) => ({ ...x, _id: index+"" }));

/**
 * Types
 */
type FetchTemplatesResponse = { templates: ITemplate[] };
type FetchTicketsResponse = { tickets: ITicket[] };
type CreateTicketResponse = { _id: string };
type FetchRiskCategoriesResponse = { riskCategories: string[] };
