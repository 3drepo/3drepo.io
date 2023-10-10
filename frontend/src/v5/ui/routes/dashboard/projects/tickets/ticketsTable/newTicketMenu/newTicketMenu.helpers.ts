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

import { ContainersHooksSelectors, FederationsHooksSelectors } from '@/v5/services/selectorsHooks';
import { isCommenterRole } from '@/v5/store/store.helpers';
import { useSearchParam } from '@/v5/ui/routes/useSearchParam';

export const getSelectedModels = () => {
	const [models] = useSearchParam('models');
	const containers = ContainersHooksSelectors.selectContainers();
	const federations = FederationsHooksSelectors.selectFederations();

	return [...containers, ...federations].filter(({ _id }) => models?.includes(_id));
};

export const getSelectedModelsNonViewerPermission = () => getSelectedModels().filter(({ role }) => !isCommenterRole(role));
