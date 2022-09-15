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

import { TeamspaceAndProjectId } from '@/v5/store/store.types';
import { ITicket, ITemplate, ITemplateDetails } from '@/v5/store/tickets/tickets.types';
import api from './default';

export const fetchContainerTickets = async ({
	teamspace,
	projectId,
	modelId,
}: FetchModelTicketsParams): Promise<FetchModelTicketsResponse> => {
	const { data } = await api.get(`teamspaces/${teamspace}/projects/${projectId}/containers/${modelId}/tickets`);
	return data.tickets;
};

export const fetchFederationTickets = async ({
	teamspace,
	projectId,
	modelId,
}: FetchModelTicketsParams): Promise<FetchModelTicketsResponse> => {
	const { data } = await api.get(`teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/tickets`);
	return data.tickets;
};

export const fetchTemplates = async (teamspace: string): Promise<FetchTemplatesResponse> => {
	const { data } = await api.get(`teamspaces/${teamspace}/settings/tickets/templates`);
	return data.templates;
};

export const fetchTemplateDetails = async (
	teamspace: string,
	templateId: string,
): Promise<FetchTemplateDetailsResponse> => {
	const { data } = await api.get(`teamspaces/${teamspace}/settings/tickets/templates/${templateId}`);
	return data;
};

/**
 * Types
 */
type FetchTemplatesResponse = { templates: ITemplate[] };
type FetchTemplateDetailsResponse = ITemplateDetails[];

type FetchModelTicketsParams = TeamspaceAndProjectId & { modelId: string };
type FetchModelTicketsResponse = { tickets: ITicket[] };
