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

import { View } from '@/v5/store/store.types';
import { EMPTY_VIEW } from '@/v5/store/store.helpers';
import { generateV5ApiUrl } from '@/v5/services/api/default';
import { clientConfigService } from '@/v4/services/clientConfig';
import { SelectProps } from '@controls/inputs/select/select.component';
import { ProjectsHooksSelectors, TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { Thumbnail, ThumbnailPlaceholder, ViewLabel, MenuItemView, Select } from './selectView.styles';

const getThumbnailBasicPath = (
	teamspace: string,
	projectId: string,
	containerOrFederationId: string,
	isContainer: boolean,
) => {
	const pathSegment = isContainer ? 'containers' : 'federations';
	return (viewId: string) => generateV5ApiUrl(
		`teamspaces/${teamspace}/projects/${projectId}/${pathSegment}/${containerOrFederationId}/views/${viewId}/thumbnail`,
		clientConfigService.GET_API,
	);
};

export type SelectViewProps = Omit<SelectProps, 'children'> & {
	views: View[];
	containerOrFederationId: string;
	isContainer?: boolean;
};

export const SelectView = ({ views, containerOrFederationId, isContainer, ...props }: SelectViewProps) => {
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const project = ProjectsHooksSelectors.selectCurrentProject();
	const getThumbnail = getThumbnailBasicPath(teamspace, project, containerOrFederationId, isContainer);

	return (
		<Select {...props}>
			{[EMPTY_VIEW].concat(views || []).map((view) => (
				<MenuItemView
					key={view._id}
					value={view._id}
				>
					{view.hasThumbnail ? (
						<Thumbnail
							src={getThumbnail(view._id)}
							alt={view.name}
						/>
					) : (
						<ThumbnailPlaceholder />
					)}
					<ViewLabel>
						{view.name}
					</ViewLabel>
				</MenuItemView>
			))}
		</Select>
	);
};
