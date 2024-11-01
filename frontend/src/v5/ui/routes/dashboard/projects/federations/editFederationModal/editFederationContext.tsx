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

import { GroupedContainer, IFederation } from '@/v5/store/federations/federations.types';
import { createContext, useEffect, useState } from 'react';
import { orderBy, uniq } from 'lodash';
import { FederationsHooksSelectors } from '@/v5/services/selectorsHooks';

export interface EditFederationContextType {
	includedContainersIds: string[];
	setIncludedContainersIds: React.Dispatch<React.SetStateAction<string[]>>;
	groupsByContainer: Record<string, string>;
	setGroupsByContainer: (groupsByContainer) => void;
	getGroupedContainers: () => GroupedContainer[];
	groups: string[];
	isReadOnly: boolean;
}
const defaultValue: EditFederationContextType = {
	includedContainersIds: [],
	setIncludedContainersIds: () => {},
	groupsByContainer: {},
	setGroupsByContainer: () => {},
	getGroupedContainers: () => [],
	groups: [],
	isReadOnly: false,
};
export const EditFederationContext = createContext(defaultValue);
EditFederationContext.displayName = 'EditFederationContext';

export interface Props { federation: IFederation | null, children: any }
export const EditFederationContextComponent = ({ federation, children }: Props) => {
	const getGroupsByContainer = () => federation?.containers?.reduce(
		(acc, { _id, group }) => ({ ...acc, [_id]: group }),
		{},
	);
	const [includedContainersIds, setIncludedContainersIds] = useState<string[]>([]);
	const [groupsByContainer, setGroupsByContainer] = useState(getGroupsByContainer() || {});
	const federations = FederationsHooksSelectors.selectFederations();

	const getGroupedContainers = () => includedContainersIds.map((_id) => {
		const container: GroupedContainer = { _id };
		const group = groupsByContainer[_id];
		if (group) {
			container.group = group;
		}
		return container;
	});

	const existingGroups = federations.flatMap((f) => f.containers.map(({ group }) => group));
	const unsortedGroups = uniq(existingGroups.concat(Object.values(groupsByContainer))).filter(Boolean);
	const groups = orderBy(unsortedGroups, (g) => g.toLowerCase());
	const isReadOnly = federation && !FederationsHooksSelectors.selectHasCollaboratorAccess(federation._id);

	useEffect(() => {
		if (!federation?.containers) return;
		const containersToInclude = federation.containers
			.map(({ _id }) => _id)
			// filter containers for users without sufficient permission
			.filter(Boolean);
		setIncludedContainersIds(containersToInclude);
	}, [federation?.containers]);

	return (
		<EditFederationContext.Provider
			value={{
				includedContainersIds,
				setIncludedContainersIds,
				groupsByContainer,
				setGroupsByContainer,
				getGroupedContainers,
				groups,
				isReadOnly,
			}}
		>
			{children}
		</EditFederationContext.Provider>
	);
};
