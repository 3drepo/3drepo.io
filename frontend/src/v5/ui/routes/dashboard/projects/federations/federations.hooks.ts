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

import { useEffect } from 'react';
import { useParams } from 'react-router';
import { FederationsHooksSelectors } from '@/v5/services/selectorsHooks';
import { FederationsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { DashboardParams } from '@/v5/ui/routes/routes.constants';

export const useFederationsData = () => {
	const { teamspace, project } = useParams<DashboardParams>();

	const federations = FederationsHooksSelectors.selectFederations();
	const favouriteFederations = FederationsHooksSelectors.selectFavouriteFederations();
	const isListPending = FederationsHooksSelectors.selectIsListPending();

	useEffect(() => {
		FederationsActionsDispatchers.fetchFederations(teamspace, project);
	}, [project]);

	return {
		federations,
		favouriteFederations,
		isListPending,
	};
};
