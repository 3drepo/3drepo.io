/**
 *  Copyright (C) 2026 3D Repo Ltd
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

import { useParams } from 'react-router-dom';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { ContainersHooksSelectors, FederationsHooksSelectors, ViewpointsHooksSelectors } from '@/v5/services/selectorsHooks';
import { modelIsFederation } from '@/v5/store/tickets/tickets.helpers';
import { AddFabButton } from '@controls/button/addFabButton/addFabButton.component';
import { formatMessage } from '@/v5/services/intl';
import { ViewerPanelFooter } from './viewsCardFooter.styles';
import { ViewpointsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { PresetViews } from './presetViews/presetViews.component';

export const ViewsCardFooter = () => {
	const { teamspace, containerOrFederation } = useParams<ViewerParams>();
	const isFederation = modelIsFederation(containerOrFederation);
	const isCommenter = isFederation
		? FederationsHooksSelectors.selectHasCommenterAccess(containerOrFederation)
		: ContainersHooksSelectors.selectHasCommenterAccess(containerOrFederation);

	const newViewpoint = ViewpointsHooksSelectors.selectNewViewpoint();
	const viewpoints = ViewpointsHooksSelectors.selectViewpointsList();

	const handleAddViewpoint = () => {
		ViewpointsActionsDispatchers.prepareNewViewpoint(teamspace, containerOrFederation, `View ${viewpoints.length + 1}`);
	};

	return (
		<ViewerPanelFooter container alignItems="center">
			<PresetViews />
			<AddFabButton
				aria-label="Add view"
				onClick={handleAddViewpoint}
				tooltipText={formatMessage({ id: 'viewer.cards.views.addViewTooltip', defaultMessage: 'Add View' })}
				disabled={!!newViewpoint || !isCommenter}
			/>
		</ViewerPanelFooter>
	);
};

