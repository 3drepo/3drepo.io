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

import { clientConfigService } from '@/v4/services/clientConfig';
import { generateV5ApiUrl } from '@/v5/services/api/default';
import { CurrentUserHooksSelectors } from '@/v5/services/selectorsHooks';
import { Quota, QuotaUnit } from './teamspaces.redux';

export const DEFAULT_TEAMSPACE_IMG_SRC = 'assets/images/teamspace_placeholder.svg';

export const getTeamspaceImgSrc = (teamspace: string) => {
	const { username, avatarUrl } = CurrentUserHooksSelectors.selectCurrentUser();
	const isPersonalTeamspace = teamspace === username;
	return isPersonalTeamspace ? avatarUrl : generateV5ApiUrl(`teamspaces/${teamspace}/avatar`, clientConfigService.GET_API);
};

export const isQuotaUnitUnlimited = (quotaUnit: QuotaUnit) => quotaUnit.available === 'unlimited';

export const isQuotaUnitCapped = (quotaUnit: QuotaUnit) => quotaUnit.available <= quotaUnit.used;

export const isQuotaExpired = (quota:Quota) => quota.expiryDate >= +new Date();
