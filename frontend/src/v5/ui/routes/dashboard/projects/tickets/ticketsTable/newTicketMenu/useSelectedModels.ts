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
import { Transformers, useSearchParam } from '@/v5/ui/routes/useSearchParam';
import { TicketContext } from '@/v5/ui/routes/viewer/tickets/ticket.context';
import {  useContext, useMemo } from 'react';

export const useSelectedModelsIds = () => {
	const { isViewer, containerOrFederation } = useContext(TicketContext);
	const [containerAndFederations] = useSearchParam('models', Transformers.STRING_ARRAY);

	if (isViewer) return [containerOrFederation];
	return containerAndFederations;
};

export const useSelectedModels = () => {
	const modelsIds = useSelectedModelsIds();
	
	const containers = ContainersHooksSelectors.selectContainers();
	const federations = FederationsHooksSelectors.selectFederations();

	return useMemo(() => 
		[...containers, ...federations].filter(({ _id }) => modelsIds?.includes(_id)),
	[containers, federations, modelsIds]);
};
