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

import { useParams } from 'react-router';
import { View } from '@/v5/store/store.types';
import { EMPTY_VIEW } from '@/v5/store/store.helpers';
import { generateV5ApiUrl } from '@/v5/services/api/default';
import { clientConfigService } from '@/v4/services/clientConfig';
import { FormSelectProps } from '@controls/formSelect/formSelect.component';
import { Thumbnail, ThumbnailPlaceholder, FormSelect, ViewLabel, MenuItemView } from './formSelectView.styles';

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

type FormSelectViewProps = Omit<FormSelectProps, 'children'> & {
	views: View[];
	containerOrFederationId: string;
	isContainer?: boolean;
};

export const FormSelectView = ({ views, containerOrFederationId, isContainer, ...formProps }: FormSelectViewProps) => {
	const { teamspace, project } = useParams() as { teamspace: string, project: string };
	const getThumbnail = getThumbnailBasicPath(teamspace, project, containerOrFederationId, isContainer);

	return (
		<FormSelect
			{...formProps}
		>
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
		</FormSelect>
	);
};
