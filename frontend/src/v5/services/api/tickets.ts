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
import { ITicket, ITemplate, NewTicket, Group } from '@/v5/store/tickets/tickets.types';
import api from './default';

export const modelType = (isFed: boolean) => (isFed ? 'federations' : 'containers');

export const fetchContainerTemplates = async (
	teamspace: string,
	projectId: string,
	containerId: string,
	getDetails?: boolean,
): Promise<FetchTemplatesResponse> => {
	const { data } = await api.get(`teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}/tickets/templates?getDetails=${getDetails}`);
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
	getDetails?: boolean,
): Promise<FetchTemplatesResponse> => {
	const { data } = await api.get(`teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}/tickets/templates?getDetails=${getDetails}`);
	return data.templates;
};

export const fetchFederationTemplate = async (
	teamspace: string,
	projectId: string,
	federationId: string,
	templateId: string,
): Promise<ITemplate> => {
	const { data } = await api.get(`teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}/tickets/templates/${templateId}`);
	return data;
};

export const fetchContainerTickets = async (
	teamspace: string,
	projectId: string,
	containerId: string,
	filter?: string[],
): Promise<FetchTicketsResponse> => {
	const { data } = await api.get(`teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}/tickets?filter=${filter.join()}`);
	return data.tickets;
};

export const fetchFederationTickets = async (
	teamspace: string,
	projectId: string,
	federationId: string,
	filter?: string[],
): Promise<FetchTicketsResponse> => {
	const { data } = await api.get(`teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}/tickets?filter=${filter.join()}`);
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

export const fetchTicketGroup = async (
	teamspace: string,
	projectId: string,
	modelId: string,
	ticketId: string,
	groupId: string,
	isFed: boolean,
	revision?: string,
) => {
	let url = `teamspaces/${teamspace}/projects/${projectId}/${modelType(isFed)}/${modelId}/tickets/${ticketId}/groups/${groupId}`;
	if (revision) {
		url += `?revId=${revision}`;
	}
	const { data } = await api.get(url);
	return data;
};

export const updateTicketGroup = async (
	teamspace: string,
	projectId: string,
	modelId: string,
	ticketId: string,
	groupId: string,
	group: Group,
	isFed: boolean,
) => {
	const { data } = await api.patch(`teamspaces/${teamspace}/projects/${projectId}/${modelType(isFed)}/${modelId}/tickets/${ticketId}/groups/${groupId}`, group);
	return data;
};

/**
 * Types
 */
type FetchTemplatesResponse = { templates: ITemplate[] };
type FetchTicketsResponse = { tickets: ITicket[] };
type CreateTicketResponse = { _id: string };
type FetchRiskCategoriesResponse = { riskCategories: string[] };
