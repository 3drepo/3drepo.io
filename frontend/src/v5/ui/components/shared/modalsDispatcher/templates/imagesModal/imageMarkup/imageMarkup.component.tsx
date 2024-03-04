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
import { MODES } from '@/v4/routes/components/screenshotDialog/markupStage/markupStage.helpers';
import { MarkupToolbar } from './markupToolbar/markupToolbar.component';
import { CALLOUTS, FONT_SIZE, SHAPES, STROKE_WIDTH } from './imageMarkup.types';
import { Container, ImageSizesRefContainer, MarkupStageContainer, MarkupToolbarContainer } from './imageMarkup.styles';
import { useRef, useState } from 'react';
import { MarkupRefObject, MarkupStage } from '@/v4/routes/components/screenshotDialog/markupStage/markupStage.component';
import { CanvasHistoryActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { Spinner } from '@controls/spinnerLoader/spinnerLoader.styles';
import { aspectRatio } from '@/v4/helpers/aspectRatio';

type ImageMarkupProps = {
	image: string,
	onSave: (img) => void;
	onClose: () => void;
};
export const ImageMarkup = ({ image, onSave, onClose }: ImageMarkupProps) => {
	const [selectedObjectName, setSelectedObjectName] = useState('');
	const [color, setColor] = useState('#d32c1fff');
	const [strokeWidth, setStrokeWidth] = useState(STROKE_WIDTH.M);
	const [fontSize, setFontSize] = useState(FONT_SIZE.M);
	const [mode, setMode] = useState(MODES.BRUSH);
	const [shape, setShape] = useState(SHAPES.RECTANGLE);
	const [callout, setCallout] = useState(CALLOUTS.RECTANGLE);
	const [stageSizes, setStageSizes] = useState({ height: 0, width: 0 });
	const markupRef = useRef<MarkupRefObject>(null);
	const imageSizesRef = useRef(null);
	
	const cursor = !selectedObjectName && [MODES.SHAPE, MODES.CALLOUT].includes(mode) ? 'crosshair' : 'default';
	const activeShape = mode === MODES.SHAPE ? shape : callout;

	const onScaleStage = (scaledImg) => {
		const computedProperties = window.getComputedStyle(imageSizesRef.current, null);

		const maxHeight = Number(computedProperties.getPropertyValue('height').replace('px', ''));
		const maxWidth = Number(computedProperties.getPropertyValue('width').replace('px', ''));

		const { naturalWidth, naturalHeight } = scaledImg.attrs.image;
		let newStageSizes;
		if (naturalWidth < maxWidth && naturalHeight < maxHeight) {
			newStageSizes = { height: naturalHeight, width: naturalWidth };
		} else {
			const { scaledWidth, scaledHeight } = aspectRatio(naturalWidth, naturalHeight, maxWidth, maxHeight);
			newStageSizes = { height: scaledHeight, width: scaledWidth };
		}
		scaledImg.setAttrs(newStageSizes);
		setStageSizes(newStageSizes);
	};

	const handleSave = async () => {
		const screenshot = await markupRef.current.getScreenshot();
		onSave(screenshot);
		onClose();
	};

	const updateElement = (updatedElement) => {
		if (selectedObjectName) {
			CanvasHistoryActionsDispatchers.update(selectedObjectName, updatedElement);
		}
	};

	const handletrokeWidthChange = (value) => {
		setStrokeWidth(value);
		updateElement({ strokeWidth: value });
	};

	const handleFontSizeChange = (value) => {
		setFontSize(value);
		updateElement({ fontSize: value });
	};

	const handleColorChange = (value) => {
		setColor(value);
		updateElement({ color: value });
	};

	const handleModeChange = (newMode) => {
		if (selectedObjectName) {
			setSelectedObjectName('');
		}
	
		setMode(newMode);
	};

	const handleCalloutChange = (newCallout) => {
		setCallout(newCallout);
		setMode(MODES.CALLOUT);
	};

	const handleShapeChange = (newShape) => {
		setShape(newShape);

		if (newShape === SHAPES.POLYGON) {
			setMode(MODES.POLYGON);
			return;
		}

		if (mode !== MODES.SHAPE) {
			setMode(MODES.SHAPE);
		}
	};

	return (
		<Container $cursor={cursor}>
			<ImageSizesRefContainer src={image} ref={imageSizesRef} />
			<MarkupStageContainer>
				<MarkupStage
					sourceImage={image}
					onScaleStage={onScaleStage}
					markupRef={markupRef}
					activeShape={activeShape}
					color={color}
					selectedObjectName={selectedObjectName}
					strokeWidth={strokeWidth}
					mode={mode}
					fontSize={fontSize}
					onSelectedObjectNameChange={setSelectedObjectName}
					onModeChange={setMode}
					sizes={stageSizes}
				/>
			</MarkupStageContainer>
			{!markupRef.current ? (<Spinner />) : (
				<MarkupToolbarContainer>
					<MarkupToolbar
						onSave={handleSave}
						onClose={onClose}
						strokeWidth={strokeWidth}
						fontSize={fontSize}
						color={color}
						onClearClick={markupRef.current.clearCanvas}
						onStrokeWidthChange={handletrokeWidthChange}
						onFontSizeChange={handleFontSizeChange}
						onColorChange={handleColorChange}
						mode={mode}
						onModeChange={handleModeChange}
						shape={shape}
						onShapeChange={handleShapeChange}
						callout={callout}
						onCalloutChange={handleCalloutChange}
						selectedObjectName={selectedObjectName}
					/>
				</MarkupToolbarContainer>
			)}
		</Container>
	);
};
