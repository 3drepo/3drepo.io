import * as React from 'react';
import ChangeHistoryIcon from '@material-ui/icons/ChangeHistory';
import CropSquareIcon from '@material-ui/icons/CropSquare';
import RemoveIcon from '@material-ui/icons/Remove';
import PanoramaFishEyeIcon from '@material-ui/icons/PanoramaFishEye';
import SvgIcon from '@material-ui/core/SvgIcon';
import { SHAPE_TYPES } from '../shape/shape.constants';
import { COLOR } from '../../../../../styles';

const CloudIcon = () => (
	<SvgIcon>
		<g>
			<path
				fill={'none'}
				stroke={COLOR.BLACK_54}
				strokeWidth={2}
				paintOrder={'fill stroke markers'}
				d={
					`M2.4 11.2C -0.8 12.8 -0.8 16.8 7.2 16.8C 8.8 19.2 14.4 19.2 16 16.8 C22.4 16.8 22.4 14.4
					20 12.8 C23.2 8 18.4 7.2 16 8.8 C14.4 5.2 8.8 6.4 8.8 8.8 C4.8 5.2 0.8 6.4 2.4 11.2Z`
				}
			/>
		</g>
	</SvgIcon>
);

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

export const SHAPES_MENU = [
	RECTANGLE_ITEM,
	TRIANGLE_ITEM,
	CIRCLE_ITEM,
	LINE_ITEM,
	CLOUD_ITEM
];

const SHAPE_ICONS = {
	[SHAPE_TYPES.RECTANGLE]: CropSquareIcon,
	[SHAPE_TYPES.TRIANGLE]: ChangeHistoryIcon,
	[SHAPE_TYPES.CIRCLE]: PanoramaFishEyeIcon,
	[SHAPE_TYPES.LINE]: RemoveIcon,
	[SHAPE_TYPES.CLOUD]: CloudIcon
};

export const activeShapeIcon = (activeShape) => SHAPE_ICONS[activeShape];
