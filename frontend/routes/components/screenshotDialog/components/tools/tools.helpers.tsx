import * as React from 'react';
import ChangeHistoryIcon from '@material-ui/icons/ChangeHistory';
import CropSquareIcon from '@material-ui/icons/CropSquare';
import RemoveIcon from '@material-ui/icons/Remove';
import PanoramaFishEyeIcon from '@material-ui/icons/PanoramaFishEye';
import SvgIcon from '@material-ui/core/SvgIcon';
import { SHAPE_TYPES } from '../shape/shape.constants';
import { COLOR } from '../../../../../styles';
import { firstCloud, secondCloud } from '../shape/shape.helpers';

const Cloud1Icon = (props) => {
	return (
		<SvgIcon>
			<g>
				<path
					fill={'none'}
					stroke={COLOR.BLACK_54}
					strokeWidth={15}
					paintOrder={'fill stroke markers'}
					d={firstCloud.path}
					transform={`scale(0.045)`}
				/>
			</g>
		</SvgIcon>
	);
}
const Cloud2Icon = () => (
	<SvgIcon>
		<g>
			<path
				fill={'none'}
				stroke={COLOR.BLACK_54}
				strokeWidth={15}
				paintOrder={'fill stroke markers'}
				d={secondCloud.path}
				transform={`scale(0.045)`}
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

const CLOUD1_ITEM = {
	name: SHAPE_TYPES.CLOUD1,
	Icon: Cloud1Icon
};

const CLOUD2_ITEM = {
	name: SHAPE_TYPES.CLOUD2,
	Icon: Cloud2Icon
};

export const SHAPES_MENU = [
	RECTANGLE_ITEM,
	TRIANGLE_ITEM,
	CIRCLE_ITEM,
	LINE_ITEM,
	CLOUD1_ITEM,
	CLOUD2_ITEM
];

const SHAPE_ICONS = {
	[SHAPE_TYPES.RECTANGLE]: CropSquareIcon,
	[SHAPE_TYPES.TRIANGLE]: ChangeHistoryIcon,
	[SHAPE_TYPES.CIRCLE]: PanoramaFishEyeIcon,
	[SHAPE_TYPES.LINE]: RemoveIcon,
	[SHAPE_TYPES.CLOUD1]: Cloud1Icon,
	[SHAPE_TYPES.CLOUD2]: Cloud2Icon
};

export const activeShapeIcon = (activeShape) => SHAPE_ICONS[activeShape];
