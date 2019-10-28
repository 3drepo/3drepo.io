import * as React from 'react';

import SvgIcon from '@material-ui/core/SvgIcon';
import ArrowIcon from '@material-ui/icons/ArrowRightAlt';
import ChangeHistoryIcon from '@material-ui/icons/ChangeHistory';
import CropSquareIcon from '@material-ui/icons/CropSquare';
import PanoramaFishEyeIcon from '@material-ui/icons/PanoramaFishEye';
import RemoveIcon from '@material-ui/icons/Remove';
import { COLOR } from '../../../../../styles';
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
					transform={`scale(0.045)`}
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

export const SHAPES_MENU = [
	RECTANGLE_ITEM,
	TRIANGLE_ITEM,
	CIRCLE_ITEM,
	LINE_ITEM,
	CLOUD_ITEM,
	ARROW_ITEM
];

const SHAPE_ICONS = {
	[SHAPE_TYPES.RECTANGLE]: CropSquareIcon,
	[SHAPE_TYPES.TRIANGLE]: ChangeHistoryIcon,
	[SHAPE_TYPES.CIRCLE]: PanoramaFishEyeIcon,
	[SHAPE_TYPES.LINE]: RemoveIcon,
	[SHAPE_TYPES.CLOUD]: CloudIcon,
	[SHAPE_TYPES.ARROW]: ArrowIcon
};

export const activeShapeIcon = (activeShape) => SHAPE_ICONS[activeShape];
