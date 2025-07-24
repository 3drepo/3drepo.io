/**
 *  Copyright (C) 2024 3D Repo Ltd
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
import { DrawingsCardHooksSelectors, DrawingsHooksSelectors } from '@/v5/services/selectorsHooks';
import { DrawingItem } from './drawingItem/drawingItem.component';
import { CentredContainer } from '@controls/centredContainer';
import { Loader } from '@/v4/routes/components/loader/loader.component';
import { IDrawing } from '@/v5/store/drawings/drawings.types';
import { VirtualisedList, TableRow, FillerRow } from './drawingsList.styles';
import { CardContent, CardList } from '@components/viewer/cards/card.styles';
import { forwardRef, useContext, useEffect, useRef } from 'react';
import { ViewerCanvasesContext } from '../../viewerCanvases.context';
import { AutocompleteSearchInput } from '@controls/search/autocompleteSearchInput/autocompleteSearchInput.component';
import { DrawingsCardActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { EmptyListMessage } from '@controls/dashedContainer/emptyListMessage/emptyListMessage.styles';
import { FormattedMessage } from 'react-intl';
import {  enableRealtimeNewDrawing } from '@/v5/services/realtime/drawings.events';
import { useParams } from 'react-router';
import { ViewerParams } from '../../../routes.constants';
import { useSearchParam } from '../../../useSearchParam';

const Table = forwardRef(({ children, ...props }, ref: any) => {
	const queries = DrawingsCardHooksSelectors.selectQueries();
	return (
		<div ref={ref} {...props}>
			<CardContent>
				<AutocompleteSearchInput
					value={queries}
					onChange={DrawingsCardActionsDispatchers.setQueries}
				/>
				{children}
			</CardContent>
		</div>
	);
});

const EmptyPlaceholder = forwardRef((props, ref: any) => (
	<div ref={ref} {...props}>
		<EmptyListMessage>
			<FormattedMessage id="viewer.cards.drawings.noResults" defaultMessage="No drawings found. Please try another search." />
		</EmptyListMessage>
	</div>
));

export const DrawingsList = () => {
	const drawings = DrawingsCardHooksSelectors.selectDrawingsFilteredByQueries();
	const { teamspace, project } = useParams<ViewerParams>();
	const isLoading = DrawingsHooksSelectors.selectAreStatsPending();
	const { open2D } = useContext(ViewerCanvasesContext);
	const virtuosoRef = useRef<any>(undefined);
	const [selectedDrawingId] = useSearchParam('drawingId');
	const selectedIndex = drawings.findIndex((d) => d._id === selectedDrawingId);

	useEffect(() => { enableRealtimeNewDrawing(teamspace, project); }, [project]);

	if (isLoading) return (
		<CentredContainer>
			<Loader />
		</CentredContainer>
	);


	useEffect(() => {
		virtuosoRef.current.scrollToIndex({
			behavior: 'instant',
			block: 'nearest',
			align: 'start',
			index: selectedIndex,
		});
	}, [drawings.length]);

	return (
        // @ts-ignore
        <VirtualisedList
			ref={virtuosoRef}
			data={drawings}
			totalCount={drawings.length}
			components={{
				Table,
				TableBody: CardList,
				TableRow,
				FillerRow,
				EmptyPlaceholder,
			}}
			itemContent={(index, drawing: IDrawing) => (
				<DrawingItem
					drawing={drawing}
					key={drawing._id}
					onClick={() => open2D(drawing._id)}
				/>
			)}
		/>
    );
};
