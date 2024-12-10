/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import { AddOn } from '@/v5/store/store.types';
import api, { generateV5ApiUrl } from './default';
import { clientConfigService } from '@/v4/services/clientConfig';
import { compact } from 'lodash';

export const fetchTeamspaces = (): Promise<any> => api.get('teamspaces');

export const fetchQuota = (teamspace: string): Promise<any> => api.get(`teamspaces/${teamspace}/quota`);

export const fetchAddons = async (teamspace: string): Promise<AddOn[]> => {
	const { data } = await api.get(`teamspaces/${teamspace}/addOns`);
	return data.modules;
};

export const getActivityLogURL = (teamspace: string, from: Date, to: Date): string => {
	const fromQuery = from && `from=${from}`;
	const toQuery = to && `to=${to}`;
	const rangeQuery = compact([fromQuery, toQuery]).join('&');

	return generateV5ApiUrl(
		`teamspaces/${teamspace}/settings/activities/archive?${rangeQuery}`,
		clientConfigService.GET_API,
	);
};
