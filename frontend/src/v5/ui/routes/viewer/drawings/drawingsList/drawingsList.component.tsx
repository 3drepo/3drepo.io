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
import { DrawingsHooksSelectors } from '@/v5/services/selectorsHooks';
import { DrawingItem } from './drawingItem/drawingItem.component';
import { CentredContainer } from '@controls/centredContainer';
import { Loader } from '@/v4/routes/components/loader/loader.component';
import { IDrawing } from '@/v5/store/drawings/drawings.types';
import { VirtualisedList, TableRow } from './drawingsList.styles';
import { CardContent, CardList } from '@components/viewer/cards/card.styles';
import { forwardRef, useContext, useEffect } from 'react';
import { ViewerCanvasesContext } from '../../viewerCanvases.context';
import { enableRealtimeDrawingRemoved, enableRealtimeDrawingUpdate, enableRealtimeNewDrawing } from '@/v5/services/realtime/drawings.events';
import { useParams } from 'react-router';
import { ViewerParams } from '../../../routes.constants';
import { combineSubscriptions } from '@/v5/services/realtime/realtime.service';
import { enableRealtimeDrawingNewRevision, enableRealtimeDrawingRevisionUpdate } from '@/v5/services/realtime/drawingRevision.events';
import { flattenDeep } from 'lodash';

const Table = forwardRef(({ children, ...props }, ref: any) => (
	<table ref={ref} {...props}>
		<CardContent>{children}</CardContent>
	</table>
));

export const DrawingsList = () => {
	const { teamspace, project } = useParams<ViewerParams>();
	const allDrawings = DrawingsHooksSelectors.selectDrawings();
	const nonEmptyDrawings = allDrawings.filter((d) => d.revisionsCount > 0);
	const isLoading = DrawingsHooksSelectors.selectAreStatsPending();
	const { open2D } = useContext(ViewerCanvasesContext);

	useEffect(() => enableRealtimeNewDrawing(teamspace, project), [project]);

	if (isLoading) return (
		<CentredContainer>
			<Loader />
		</CentredContainer>
	);

	useEffect(() => {
		const subscriptionsPerDrawing = allDrawings.map(({ _id }) => [
			enableRealtimeDrawingRemoved(teamspace, project, _id),
			enableRealtimeDrawingUpdate(teamspace, project, _id),
			enableRealtimeDrawingRevisionUpdate(teamspace, project, _id),
			enableRealtimeDrawingNewRevision(teamspace, project, _id),
		]);
		return combineSubscriptions(...flattenDeep(subscriptionsPerDrawing));
	}, [allDrawings.length]);

	return (
		// @ts-ignore
		<VirtualisedList
			data={nonEmptyDrawings}
			totalCount={nonEmptyDrawings.length}
			components={{
				Table,
				TableBody: CardList,
				TableRow,
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
