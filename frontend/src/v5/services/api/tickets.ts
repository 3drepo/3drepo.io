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
import { ITicket, ITemplate, NewTicket, MinimumComment } from '@/v5/store/tickets/tickets.types';
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
	comment: MinimumComment,
) => {
	// const { data } = await api.get(
		// `/teamspaces/${teamspace}/projects/${projectId}/federation/${federationId}/tickets/${ticketId}/comments`,
	// );
	// return data;
	return new Date().toString();
};

export const createContainerTicketComment = async (
	teamspace: string,
	projectId: string,
	containerId: string,
	ticketId: string,
	comment: MinimumComment,
) => {
	// const { data } = await api.get(
		// `/teamspaces/${teamspace}/projects/${projectId}/container/${containerId}/tickets/${ticketId}/comments`,
	// );
	// return data;
	return new Date().toString();
};

export const createFederationsComment = async (
	teamspace: string,
	projectId: string,
	federationId: string,
	ticketId: string,
	comment: string,
) => {
	const { data } = await api.post(
		`/teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}/tickets/${ticketId}/comments`,
		{ comment },
	);
	return data;
};

export const createContainerComment = async (
	teamspace: string,
	projectId: string,
	containerId: string,
	ticketId: string,
	comment: string,
) => {
	const { data } = await api.post(
		`/teamspaces/${teamspace}/projects/${projectId}/container/${containerId}/tickets/${ticketId}/comments`,
		{ comment },
	);
};

const MOCK_COMMENTS = [
	{
		// teamspace: 'localuser1',
		author: 'localuser2',
		comment: '# localuser2\n\nA comment from an external user',
		createdAt: new Date('12 12 2021'),
		deleted: false,
	},
	{
		// teamspace: 'localuser1',
		author: 'localuser1',
		comment: '# localuser1\n\nThis is n current user comment',
		createdAt: new Date('1 1 2022'),
		deleted: false,
	},
	{
		// teamspace: 'localuser1',
		author: 'localuser2',
		comment: '# localuser2\n\nA comment from an external user',
		createdAt: new Date('12 12 2021'),
		deleted: true,
	},
	{
		// teamspace: 'localuser1',
		author: 'localuser2',
		comment: '# localuser2\n\nA comment from an external user',
		createdAt: new Date('12 12 2021'),
		deleted: false,
	},
	{
		// teamspace: 'localuser1',
		author: 'localuser1',
		comment: '# localuser1\n\n> # localuser2\n\n> ___________Super duper uper bonder longgggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg sdfs dfs dfs df sdf sd fs df sdf sdf sdfsd fsdf sdf sdf sdf sdf sdf sdf sdf sdf sdf sdf sdf sdf sdf sdf\n\nok',
		createdAt: new Date('1 1 2022'),
		deleted: false,
	},
	{
		// teamspace: 'localuser1',
		author: 'localuser2',
		comment: '# localuser2\n\nA comment from an external user',
		createdAt: new Date('12 12 2021'),
		deleted: false,
	},
	{
		// teamspace: 'localuser1',
		author: 'localuser2',
		comment: '# localuser2\n\nA comment from an external user',
		createdAt: new Date('12 12 2021'),
		deleted: true,
	},
].map((x, index) => ({ ...x, _id: index+"" }));

/**
 * Types
 */
type FetchTemplatesResponse = { templates: ITemplate[] };
type FetchTicketsResponse = { tickets: ITicket[] };
type CreateTicketResponse = { _id: string };
type FetchRiskCategoriesResponse = { riskCategories: string[] };
