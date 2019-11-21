import * as React from 'react';

import SvgIcon from '@material-ui/core/SvgIcon';
import ArrowIcon from '@material-ui/icons/ArrowRightAlt';
import ChangeHistoryIcon from '@material-ui/icons/ChangeHistory';
import CropSquareIcon from '@material-ui/icons/CropSquare';
import PanoramaFishEyeIcon from '@material-ui/icons/PanoramaFishEye';
import RemoveIcon from '@material-ui/icons/Remove';
import { COLOR } from '../../../../../styles';
import { DrawPolygon } from '../../../fontAwesomeIcon';
import { SHAPE_TYPES } from '../shape/shape.constants';
import { cloud } from '../shape/shape.helpers';

const CloudIcon = (props) => {
	return (
		<SvgIcon>
			<g>
				<path
					fill={'none'}
					stroke={COLOR.BLACK_54}
					strokeWidth={15}
					paintOrder={'fill stroke markers'}
					d={cloud.path}
					transform="scale(0.045)"
				/>
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

export const SHAPES_MENU = [
	LINE_ITEM,
	ARROW_ITEM,
	CIRCLE_ITEM,
	TRIANGLE_ITEM,
	RECTANGLE_ITEM,
	CLOUD_ITEM,
	POLYGON_ITEM,
];

const SHAPE_ICONS = {
	[SHAPE_TYPES.RECTANGLE]: CropSquareIcon,
	[SHAPE_TYPES.TRIANGLE]: ChangeHistoryIcon,
	[SHAPE_TYPES.CIRCLE]: PanoramaFishEyeIcon,
	[SHAPE_TYPES.LINE]: RemoveIcon,
	[SHAPE_TYPES.CLOUD]: CloudIcon,
	[SHAPE_TYPES.ARROW]: ArrowIcon,
	[SHAPE_TYPES.POLYGON]: DrawPolygon,
};

export const activeShapeIcon = (activeShape) => SHAPE_ICONS[activeShape];

export const BRUSH_SIZES = concat(
		range(56, 26, -10),
		range(24, 4, -4),
		range(7, 0, -1)
);

export const TEXT_SIZES = concat(
		range(56, 26, -10),
		range(24, 4, -4)
);

export const MAX_TOOL_ICON_SIZE = 28;
export const MIN_BRUSH_ICON_SIZE = 5;
export const MIN_TEXT_ICON_SIZE = 10;
