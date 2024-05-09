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
import { forwardRef, useContext } from 'react';
import { ViewerCanvasesContext } from '../../viewerCanvases.context';
import { useSearchParam } from '../../../useSearchParam';

const Table = forwardRef(({ children, ...props }, ref: any) => (
	<table ref={ref} {...props}>
		<CardContent>{children}</CardContent>
	</table>
));

export const DrawingsList = () => {
	const drawings = DrawingsHooksSelectors.selectCalibratedDrawings();
	const isLoading = DrawingsHooksSelectors.selectCalibratedDrawingsHaveStatsPending();
	const { setIs2DOpen } = useContext(ViewerCanvasesContext);
	const [, setDrawingId] = useSearchParam('drawingId');

	const onDrawingClick = (drawingId) => {
		setIs2DOpen(true);
		setDrawingId(drawingId);
	};

	if (isLoading) return (
		<CentredContainer>
			<Loader />
		</CentredContainer>
	);

	return (
		// @ts-ignore
		<VirtualisedList
			data={drawings}
			totalCount={drawings.length}
			components={{
				Table,
				TableBody: CardList,
				TableRow,
			}}
			itemContent={(index, drawing: IDrawing) => (
				<DrawingItem
					drawing={drawing}
					key={drawing._id}
					onClick={() => onDrawingClick(drawing._id)}
				/>
			)}
		/>
	);
};
