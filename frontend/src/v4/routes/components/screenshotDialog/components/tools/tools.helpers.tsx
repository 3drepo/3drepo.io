/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import * as React from 'react';

import SvgIcon from '@material-ui/core/SvgIcon';
import ArrowIcon from '@material-ui/icons/ArrowRightAlt';
import ChangeHistoryIcon from '@material-ui/icons/ChangeHistory';
import CropSquareIcon from '@material-ui/icons/CropSquare';
import PanoramaFishEyeIcon from '@material-ui/icons/PanoramaFishEye';
import RemoveIcon from '@material-ui/icons/Remove';

import { DrawPolygon } from '../../../fontAwesomeIcon';
import { SHAPE_TYPES } from '../shape/shape.constants';
import { cloud } from '../shape/shape.helpers';

const CloudIcon = () => {
	return (
		<SvgIcon viewBox="0 0 500 500">
			<g>
				<path
					fill="none"
					className="stroke"
					strokeWidth={15}
					paintOrder="fill stroke markers"
					d={cloud.path}
				/>
			</g>
		</SvgIcon>
	);
};

const CalloutDotIcon = () => {
	return (
		<SvgIcon viewBox="0 0 500 500">
			<g>
				<path d="M470,30V220H280V30H470M500,0H250V250H500V0Z" />
				<line
					className="stroke"
					strokeWidth="30"
					x1="264.6"
					y1="235.4"
					x2="47.8"
					y2="452.2"
				/>
				<circle cx="50" cy="450" r="35" />
				<path d="M50,430a20,20,0,1,1-20,20,20.1,20.1,0,0,1,20-20m0-30a50,50,0,1,0,50,50,50,50,0,0,0-50-50Z" />
			</g>
		</SvgIcon>
	);
};

const CalloutCircleIcon = () => {
	return (
		<SvgIcon viewBox="0 0 500 500">
			<g>
				<path d="M470,30V220H280V30H470M500,0H250V250H500V0Z" />
				<line x1="264.6" y1="235.4" x2="136.3" y2="363.7" strokeWidth="30" className="stroke" />
				<path
					fill="none"
					strokeWidth="30"
					className="stroke"
					d="M408.5,234.4A196.6,196.6,0,0,1,415,285,199.8,199.8,0,1,1,265,91.3" />
			</g>
		</SvgIcon>
	);
};

const CalloutRectangleIcon = () => {
	return (
		<SvgIcon viewBox="0 0 500 500">
			<g>
				<path d="M470,30V220H280V30H470M500,0H250V250H500V0Z" />
				<line
					strokeWidth="30"
					className="stroke"
					x1="264.6"
					y1="235.4"
					x2="136.3"
					y2="363.7"
				/>
				<polyline
					fill="none"
					strokeWidth="30"
					className="stroke"
					points="265 85 15 85 15 485 415 485 415 235" />
			</g>
		</SvgIcon>
	);
};

const RECTANGLE_ITEM = {
	name: SHAPE_TYPES.RECTANGLE,
	Icon: CropSquareIcon
};

const TRIANGLE_ITEM = {
	name: SHAPE_TYPES.TRIANGLE,
	Icon: ChangeHistoryIcon
};

const CIRCLE_ITEM = {
	name: SHAPE_TYPES.CIRCLE,
	Icon: PanoramaFishEyeIcon
};

const LINE_ITEM = {
	name: SHAPE_TYPES.LINE,
	Icon: RemoveIcon
};

const CLOUD_ITEM = {
	name: SHAPE_TYPES.CLOUD,
	Icon: CloudIcon
};

const ARROW_ITEM = {
	name: SHAPE_TYPES.ARROW,
	Icon: ArrowIcon
};

const POLYGON_ITEM = {
	name: SHAPE_TYPES.POLYGON,
	Icon: DrawPolygon
};

const CALLOUT_DOT_ITEM = {
	name: SHAPE_TYPES.CALLOUT_DOT,
	Icon: CalloutDotIcon
};

const CALLOUT_CIRCLE_ITEM = {
	name: SHAPE_TYPES.CALLOUT_CIRCLE,
	Icon: CalloutCircleIcon
};

const CALLOUT_RECTANGLE_ITEM = {
	name: SHAPE_TYPES.CALLOUT_RECTANGLE,
	Icon: CalloutRectangleIcon
};

export const SHAPES_MENU = [
	LINE_ITEM,
	ARROW_ITEM,
	CIRCLE_ITEM,
	TRIANGLE_ITEM,
	RECTANGLE_ITEM,
	CLOUD_ITEM,
	POLYGON_ITEM,
	CALLOUT_DOT_ITEM,
	CALLOUT_RECTANGLE_ITEM,
	CALLOUT_CIRCLE_ITEM,
];

const SHAPE_ICONS = {
	[SHAPE_TYPES.RECTANGLE]: CropSquareIcon,
	[SHAPE_TYPES.TRIANGLE]: ChangeHistoryIcon,
	[SHAPE_TYPES.CIRCLE]: PanoramaFishEyeIcon,
	[SHAPE_TYPES.LINE]: RemoveIcon,
	[SHAPE_TYPES.CLOUD]: CloudIcon,
	[SHAPE_TYPES.ARROW]: ArrowIcon,
	[SHAPE_TYPES.POLYGON]: DrawPolygon,
	[SHAPE_TYPES.CALLOUT_DOT]: CalloutDotIcon,
	[SHAPE_TYPES.CALLOUT_CIRCLE]: CalloutCircleIcon,
	[SHAPE_TYPES.CALLOUT_RECTANGLE]: CalloutRectangleIcon,
};

export const activeShapeIcon = (activeShape) => SHAPE_ICONS[activeShape];

export const BRUSH_SIZES = [
	{
		label: 'XL',
		value: 26
	},
	{
		label: 'L',
		value: 14
	},
	{
		label: 'M',
		value: 6
	},
	{
		label: 'S',
		value: 3
	},
	{
		label: 'XS',
		value: 1
	},
];

export const TEXT_SIZES = [
	{
		label: 'XL',
		value: 46
	},
	{
		label: 'L',
		value: 36
	},
	{
		label: 'M',
		value: 24
	},
	{
		label: 'S',
		value: 18
	},
	{
		label: 'XS',
		value: 14
	},
];

export const initialTextSize = () => TEXT_SIZES.find((item) => item.label === 'M').value;
export const initialBrushSize = () => BRUSH_SIZES.find((item) => item.label === 'M').value;

export const MAX_TOOL_ICON_SIZE = 28;
export const MIN_BRUSH_ICON_SIZE = 5;
export const MIN_TEXT_ICON_SIZE = 10;
