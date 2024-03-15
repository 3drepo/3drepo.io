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
import CloudIcon from '@assets/icons/outlined/cloudy_square.svg';
import TriangleIcon from '@assets/icons/outlined/triangle-outlined.svg';
import CircleIcon from '@assets/icons/outlined/circle-outlined.svg';
import RectangleIcon from '@assets/icons/outlined/square-outlined.svg';
import ArrowIcon from '@assets/icons/outlined/arrow_draw-outlined.svg';
import PolygonIcon from '@assets/icons/outlined/polygon-outlined.svg';
import LineIcon from '@assets/icons/outlined/line_draw-outlined.svg';
import { formatMessage } from '@/v5/services/intl';
import { IMode, IShapeType, SHAPES } from '../../imageMarkup.types';
import { MODES } from '@/v4/routes/components/screenshotDialog/markupStage/markupStage.helpers';
import { ToolbarSelect } from '@controls/toolbarSelect/toolbarSelect.component';
import { ToolbarSelectItem } from '@controls/toolbarSelect/toolbarSelectItem/toolbarSelectItem.component';

const SHAPES_DATA: Record<IShapeType, any> = {
	[SHAPES.RECTANGLE]: {
		value: SHAPES.RECTANGLE,
		Icon: RectangleIcon,
		title: formatMessage({ id: 'imageMarkup.shape.title.rectangle', defaultMessage: 'Rectangle' }),
	},
	[SHAPES.TRIANGLE]: {
		value: SHAPES.TRIANGLE,
		Icon: TriangleIcon,
		title: formatMessage({ id: 'imageMarkup.shape.title.triangle', defaultMessage: 'Triangle' }),
	},
	[SHAPES.CIRCLE]: {
		value: SHAPES.CIRCLE,
		Icon: CircleIcon,
		title: formatMessage({ id: 'imageMarkup.shape.title.circle', defaultMessage: 'Circle' }),
	},
	[SHAPES.LINE]: {
		value: SHAPES.LINE,
		Icon: LineIcon,
		title: formatMessage({ id: 'imageMarkup.shape.title.line', defaultMessage: 'Line' }),
	},
	[SHAPES.CLOUD]: {
		value: SHAPES.CLOUD,
		Icon: CloudIcon,
		title: formatMessage({ id: 'imageMarkup.shape.title.cloud', defaultMessage: 'Cloud' }),
	},
	[SHAPES.ARROW]: {
		value: SHAPES.ARROW,
		Icon: ArrowIcon,
		title: formatMessage({ id: 'imageMarkup.shape.title.arrow', defaultMessage: 'Arrow' }),
	},
	[SHAPES.POLYGON]: {
		value: SHAPES.POLYGON,
		Icon: PolygonIcon,
		title: formatMessage({ id: 'imageMarkup.shape.title.polygon', defaultMessage: 'Polygon' }),
	},
};

type ShapeButtonProps = {
	value: IShapeType,
	onChange: (callout: IShapeType) => void,
	mode: IMode,
};
export const ShapeButton = ({ mode, value, onChange }: ShapeButtonProps) => {
	const isShapeMode = mode === MODES.SHAPE || mode === MODES.POLYGON;

	return (
		<ToolbarSelect
			value={value}
			defaultIcon={SHAPES_DATA[value].Icon}
			onChange={onChange}
			title={formatMessage({ id: 'imageMarkup.shape.button.title', defaultMessage: 'Shape' })}
			active={isShapeMode}
		>
			{Object.values(SHAPES_DATA).map((shapeData) => (
				<ToolbarSelectItem {...shapeData} key={shapeData.value} />
			))}
		</ToolbarSelect>
	);
};
