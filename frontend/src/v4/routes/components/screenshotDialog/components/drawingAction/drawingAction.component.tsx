/**
 *  Copyright (C) 2019 3D Repo Ltd
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
import { useMemo } from 'react';
import Konva from 'konva';
import { MODES } from '../../markupStage/markupStage.helpers';
import { LineDrawingAction } from './lineDrawingAction/lineDrawingAction.component';
import { ShapeDrawingAction } from './shapeDrawingAction/shapeDrawingAction.component';
import { CalloutDrawingAction } from './calloutDrawingAction/calloutDrawingAction.component';
import { PolygonDrawingAction } from './polygonDrawingAction/polygonDrawingAction.component';

interface IProps {
	color: string;
	size: number;
	textSize: number;
	mode: string;
	height: number;
	width: number;
	layer: any;
	stage: Konva.Stage;
	activeShape: number;
	selected: string;
	disabled: boolean;
	handleNewDrawnShape: (shape: number, attrs, updateState?: boolean) => void;
	handleNewDrawnLine: (line, type?, updateState?: boolean) => void;
	handleNewText: (position, text: string, width?: number, updateState?: boolean) => void;
}

const COMPONENTS_MAP = {
	[MODES.CALLOUT]: CalloutDrawingAction,
	[MODES.POLYGON]: PolygonDrawingAction,
	[MODES.SHAPE]: ShapeDrawingAction,
	[MODES.BRUSH]: LineDrawingAction,
	[MODES.ERASER]: LineDrawingAction,
};

export const DrawingAction = (props: IProps) => {
	const { mode } = props;

	const Component = useMemo(() => {
		return COMPONENTS_MAP[mode] || null;
	}, [mode]);

	return Component && <Component {...props} />;
};
