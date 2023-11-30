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
import ClearOverridesIcon from '@assets/icons/viewer/clear_overrides.svg';
import EyeHideIcon from '@assets/icons/viewer/eye_hide.svg';
import EyeShowIcon from '@assets/icons/viewer/eye_show.svg';
import EyeIsolateIcon from '@assets/icons/viewer/eye_isolate.svg';
import { formatMessage } from '@/v5/services/intl';
import { GroupsActionsDispatchers, TreeActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { GroupsHooksSelectors, TreeHooksSelectors } from '@/v5/services/selectorsHooks';
import { Section, Container } from './sectionToolbar.styles';
import { ToolbarButton } from '../buttons/toolbarButton.component';

export const SectionToolbar = () => {
	const hasOverrides = GroupsHooksSelectors.selectGroupsColourOverrides()?.length > 0;
	const hasHighlightedObjects = !!TreeHooksSelectors.selectFullySelectedNodesIds().length;
	const hasHiddenObjects = TreeHooksSelectors.selectHasHiddenNodes();

	return (
		<Container>
			<Section hidden={!hasOverrides}>
				<ToolbarButton
					hidden={!hasOverrides}
					onClick={GroupsActionsDispatchers.clearColorOverrides}
					title={formatMessage({ id: 'viewer.toolbar.icon.clearOverrides', defaultMessage: 'Clear Overrides' })}
				>
					<ClearOverridesIcon />
				</ToolbarButton>
			</Section>
			<Section hidden={!hasHighlightedObjects && !hasHiddenObjects}>
				<ToolbarButton
					hidden={!hasHiddenObjects}
					onClick={TreeActionsDispatchers.showAllNodes}
					title={formatMessage({ id: 'viewer.toolbar.icon.showAll', defaultMessage: 'Show All' })}
				>
					<EyeShowIcon />
				</ToolbarButton>
				<ToolbarButton
					hidden={!hasHighlightedObjects}
					onClick={TreeActionsDispatchers.hideSelectedNodes}
					title={formatMessage({ id: 'viewer.toolbar.icon.hide', defaultMessage: 'Hide' })}
				>
					<EyeHideIcon />
				</ToolbarButton>
				<ToolbarButton
					hidden={!hasHighlightedObjects}
					onClick={() => TreeActionsDispatchers.isolateSelectedNodes(undefined)}
					title={formatMessage({ id: 'viewer.toolbar.icon.isolate', defaultMessage: 'Isolate' })}
				>
					<EyeIsolateIcon />
				</ToolbarButton>
			</Section>
		</Container>
	);
};
