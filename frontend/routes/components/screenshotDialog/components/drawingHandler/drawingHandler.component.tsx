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

import React, { useMemo } from 'react';
// import { between } from '../../../../../helpers/between';
import { ELEMENT_TYPES, MODES } from '../../screenshotDialog.helpers';
// import { createDrawnLine, createShape, getDrawFunction } from './drawing.helpers';
import { HandleCalloutDrawing } from './handleCalloutDrawing/handleCalloutDrawing.component';

interface IProps {
	color: string;
	size: number;
	mode: string;
	height: number;
	width: number;
	layer: any;
	stage: any;
	activeShape: number;
	activeCalloutShape: number;
	selected: string;
	disabled: boolean;
	handleNewDrawnShape: (shape: number, attrs, updateState?: boolean) => void;
	handleNewDrawnLine: (line, type?, updateState?: boolean) => void;
	handleNewText: (position, updateState?: boolean) => () => any;
}

const COMPONENTS_MAP = {
	[MODES.CALLOUT]: HandleCalloutDrawing,
};

const Span = (props) => (<span {...props} />);

export const DrawingHandler = (props: IProps) => {
	const { mode } = props;

	const Component = useMemo(() => {
		return COMPONENTS_MAP[mode] || null;
	}, [mode]);

	return Component && <Component {...props} />;
};
