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

import { FederationsHooksSelectors } from '@/v5/services/selectorsHooks/federationsSelectors.hooks';
import { useEffect } from 'react';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks/projectsSelectors.hooks';
import { FederationsActionsDispatchers } from '@/v5/services/actionsDispatchers/federationsActions.dispatchers';
import { useParams } from 'react-router';

export const useFederationsData = () => {
	const { teamspace, project } = useParams() as { teamspace: string, project: string };

	const filteredFederations = FederationsHooksSelectors.selectFilteredFederations();
	const favouriteFederations = FederationsHooksSelectors.selectFilteredFavouriteFederations();
	const hasFederations = FederationsHooksSelectors.selectHasFederations();
	const currentProject = ProjectsHooksSelectors.selectCurrentProject();

	useEffect(() => {
		if (hasFederations.all) return;

		FederationsActionsDispatchers.fetchFederations(teamspace, project);
	}, [currentProject]);

	return {
		filteredFederations,
		favouriteFederations,
		hasFederations,
		isPending: false,
	};
};
