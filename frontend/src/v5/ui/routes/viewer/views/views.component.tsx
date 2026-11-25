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

import { forwardRef, useEffect, useState } from 'react';
import { CardContainer, CardContent, CardList } from '@components/viewer/cards/card.styles';
import { CardHeader } from '@components/viewer/cards/cardHeader.component';
import { formatMessage } from '@/v5/services/intl';
import ViewsIcon from '@assets/icons/outlined/view-outlined.svg';
import { ViewsCardActions } from './viewsCardActions/viewsCardActions.component';
import { ViewsCardFooter } from './viewsCardFooter/viewsCardFooter.component';
import { ViewpointsHooksSelectors } from '@/v5/services/selectorsHooks';
import { Spinner } from '@controls/spinnerLoader/spinnerLoader.styles';
import { CentredContainer } from '@controls/centredContainer';
import { IViewpoint } from '@/v5/store/viewpoints/viewpoints.types';
import { FillerRow, TableRow, VirtualisedList } from '../drawings/drawingsList/drawingsList.styles';
import { ViewItem } from './viewItem/viewItem.component';
import { NewViewpointItem } from './viewItem/viewItem.styles';
import { ViewpointsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { AutocompleteSearchInput } from '@controls/search/autocompleteSearchInput/autocompleteSearchInput.component';
import { EmptyListMessage } from '@controls/dashedContainer/emptyListMessage/emptyListMessage.styles';
import { FormattedMessage } from 'react-intl';
import { ViewerParams } from '../../routes.constants';
import { useParams } from 'react-router-dom';
import { NewView } from './viewItem/newView.component';

const Table = forwardRef(({ children, ...props }: any, ref: any) => { 
	const queries = ViewpointsHooksSelectors.selectQueries();
	return (
		<div ref={ref} {...props}>
			<CardContent>
				<AutocompleteSearchInput
					value={queries}
					onChange={ViewpointsActionsDispatchers.setQueries}
				/>
				{children}
			</CardContent>
		</div>
	);
});

const EmptyPlaceholder = forwardRef((props, ref: any) => {
	const queries = ViewpointsHooksSelectors.selectQueries();
	if (!queries.length) return (
		<div ref={ref} {...props}>
			<EmptyListMessage>
				<FormattedMessage id="viewer.cards.views.noViewsCreated" defaultMessage="No viewpoints have been created." />
			</EmptyListMessage>
		</div>
	);
	return (
		<div ref={ref} {...props}>
			<EmptyListMessage>
				<FormattedMessage id="viewer.cards.views.noViewsFound" defaultMessage="No viewpoints found. Please try another search." />
			</EmptyListMessage>
		</div>
	);
});

export const Views = () => {
	const { teamspace, containerOrFederation } = useParams<ViewerParams>();
	const viewpoints = ViewpointsHooksSelectors.selectViewpointsList();
	const newViewpoint = ViewpointsHooksSelectors.selectNewViewpoint();
	const [editMode, setEditMode] = useState(false);
	const [createMode, setCreateMode] = useState(!!newViewpoint);
	const [activeViewpoint, setActiveViewpoint] = useState<IViewpoint | null>(null);
	const isPending = ViewpointsHooksSelectors.selectIsPending();

	useEffect(() => {
		ViewpointsActionsDispatchers.subscribeOnViewpointChanges(teamspace, containerOrFederation);
		return () => {
			ViewpointsActionsDispatchers.unsubscribeOnViewpointChanges(teamspace, containerOrFederation);
		};
	}, [teamspace, containerOrFederation]);

	if (isPending) {
		return (
			<CardContainer>
				<CentredContainer>
					<Spinner />
				</CentredContainer>
			</CardContainer>
		);
	}
	return (
		<CardContainer>
			<CardHeader
				icon={<ViewsIcon />}
				title={formatMessage({ id: 'viewer.cards.views.title', defaultMessage: 'Views' })}
				actions={(<ViewsCardActions />)}
			/>
			<VirtualisedList
				data={viewpoints}
				totalCount={viewpoints.length}
				components={{
					Table,
					TableBody: CardList,
					TableRow,
					FillerRow,
					EmptyPlaceholder,
				} as any}
				itemContent={(_, viewpoint: IViewpoint) => (
					<ViewItem
						viewpoint={viewpoint}
						key={viewpoint._id}
						active={activeViewpoint?._id === viewpoint._id}
						editMode={editMode}
						setActiveViewpoint={setActiveViewpoint}
						setEditMode={setEditMode}
						createMode={createMode}
						setCreateMode={setCreateMode}
					/>
				)}
			/>
			{createMode && newViewpoint && (
				<NewViewpointItem>
					<NewView viewpoint={newViewpoint} setCreateMode={setCreateMode}/>
				</NewViewpointItem>
			)}
			<ViewsCardFooter setActiveViewpoint={setActiveViewpoint} createMode={createMode} setCreateMode={setCreateMode} />
		</CardContainer>
	);
};
