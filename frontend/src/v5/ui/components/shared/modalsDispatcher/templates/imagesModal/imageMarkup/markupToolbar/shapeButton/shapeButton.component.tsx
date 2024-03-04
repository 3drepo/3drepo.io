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
import { ClickAwayListener } from '@mui/material';
import { formatMessage } from '@/v5/services/intl';
import { useState } from 'react';
import { IMode, IShapeType, SHAPES } from '../../imageMarkup.types';
import { ToolbarButton } from '../toolbarButton/toolbarButton.component';
import { FloatingButton, FloatingButtonsContainer } from '../toolbarButton/multioptionIcons.styles';
import { ButtonOptionsContainer } from '../buttons/buttons.styles';
import { MODES } from '@/v4/routes/components/screenshotDialog/markupStage/markupStage.helpers';

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
	shape: IShapeType,
	onShapeChange: (callout: IShapeType) => void,
	mode: IMode,
};
export const ShapeButton = ({ mode, shape, onShapeChange }: ShapeButtonProps) => {
	const [expanded, setExpanded] = useState(false);

	const isShapeMode = mode === MODES.SHAPE || mode === MODES.POLYGON;

	const selectShape = (newShape: IShapeType) => {
		setExpanded(false);
		onShapeChange(newShape);
	};

	return (
		<ClickAwayListener onClickAway={() => setExpanded(false)}>
			<ButtonOptionsContainer>
				<FloatingButtonsContainer>
					{expanded && Object.values(SHAPES_DATA).map(({ value, ...shapeData }) => (
						<FloatingButton
							{...shapeData}
							onClick={() => selectShape(value)}
							selected={isShapeMode && shape === value}
							key={value}
						/>
					))}
				</FloatingButtonsContainer>
				<ToolbarButton
					Icon={SHAPES_DATA[shape].Icon}
					onClick={() => setExpanded(!expanded)}
					title={!expanded ? SHAPES_DATA[shape].title : ''}
					selected={isShapeMode}
				/>
			</ButtonOptionsContainer>
		</ClickAwayListener>
	);
};
