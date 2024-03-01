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

/* eslint-disable max-classes-per-file */
/**
 *  Copyright (C) 2017 3D Repo Ltd
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
import { PureComponent, createRef } from 'react';

import { IFontSize, IStrokeWidth } from '@components/shared/modalsDispatcher/templates/imagesModal/imageMarkup/imageMarkup.types';
import { viewportSize } from '@/v4/helpers/viewportSize';
import { aspectRatio } from '@/v4/helpers/aspectRatio';
import { renderWhenTrue } from '../../../helpers/rendering';
import { LoaderContainer } from '../../board/board.styles';
import { Loader } from '../loader/loader.component';
import { SHAPE_TYPES } from './components/shape/shape.constants';
import { Tools } from './components/tools/tools.component';
import { INITIAL_VALUES } from './screenshotDialog.helpers';
import { MODES } from './markupStage/markupStage.helpers';
import { Container } from './screenshotDialog.styles';
import { MarkupRefObject, MarkupStage } from './markupStage/markupStage.component';

const INIT_DIALOG_PADDING = 48;
const HORIZONTAL_DIALOG_PADDING = 2 * INIT_DIALOG_PADDING;
const VERTICAL_DIALOG_PADDING = 40 - 2 * INIT_DIALOG_PADDING;

const MIN_DIALOG_WIDTH = 860;
const MIN_DIALOG_HEIGHT = 300;
const INIT_DIALOG_HEIGHT = 600;

interface IProps {
	sourceImage: string | Promise<string>;
	disabled?: boolean;
	arePastElements: boolean;
	areFutureElements: boolean;
	handleResolve: (screenshot) => void;
	updateElement: (elementName, property) => void;
	undo: () => void;
	redo: () => void;
}

export class ScreenshotDialog extends PureComponent<IProps, any> {
	public state = {
		color: INITIAL_VALUES.color,
		strokeWidth: INITIAL_VALUES.brushSize,
		fontSize: INITIAL_VALUES.textSize,
		mode: INITIAL_VALUES.mode,
		activeShape: null,
		container: {
			height: INIT_DIALOG_HEIGHT,
			width: MIN_DIALOG_WIDTH,
		},
		stage: {
			height: 0,
			width: 0,
		},
		selectedObjectName: '',
		sourceImage: '',
	};

	public async componentDidMount() {
		const sourceImage = await this.props.sourceImage;
		this.setState({ sourceImage });
	}

	public componentWillUnmount() {
		this.setCursor('default');
	}

	public markupRef = createRef<MarkupRefObject>();

	private onScaleStage = (image) => {
		const { naturalWidth, naturalHeight } = image.attrs.image;
		const { width: viewportWidth, height: viewportHeight } = viewportSize();
		const maxHeight = viewportHeight - VERTICAL_DIALOG_PADDING;
		const maxWidth = viewportWidth - HORIZONTAL_DIALOG_PADDING;

		let newStageSizes;
		if (naturalWidth < maxWidth && naturalHeight < maxHeight) {
			newStageSizes = { height: naturalHeight, width: naturalWidth };
		} else {
			const { scaledWidth, scaledHeight } = aspectRatio(naturalWidth, naturalHeight, maxWidth, maxHeight);
			newStageSizes = { height: scaledHeight, width: scaledWidth };
			image.setAttrs(newStageSizes);
		}
		this.setState({
			stage: newStageSizes,
			container: {
				height: newStageSizes.height >= MIN_DIALOG_HEIGHT ? newStageSizes.height : MIN_DIALOG_HEIGHT,
				width: newStageSizes.width >= MIN_DIALOG_WIDTH ? newStageSizes.width : MIN_DIALOG_WIDTH,
			},
		});
	}

	public handleSave = () => {
		this.setState({ selectedObjectName: '' }, async () => {
			const screenshot = await this.markupRef.current.getScreenshot();
			this.props.handleResolve(screenshot);
		});
	}

	public setMode = (mode) => {
		const newState = {
			mode: this.state.mode === mode ? '' : mode
		} as any;

		if (this.state.selectedObjectName) {
			newState.selectedObjectName = '';
		}
		this.setState(() => newState);
	}

	public setBrushMode = () => this.setMode(MODES.BRUSH);

	public setEraserMode = () => this.setMode(MODES.ERASER);

	public setShapeMode = (shape) => {
		if ([SHAPE_TYPES.CALLOUT_DOT, SHAPE_TYPES.CALLOUT_CIRCLE, SHAPE_TYPES.CALLOUT_RECTANGLE].includes(shape)) {
			this.setState({
				activeShape: shape,
				mode: MODES.CALLOUT,
			});
			return;
		}

		if (shape === SHAPE_TYPES.POLYGON) {
			this.setState({
				activeShape: shape,
				mode: MODES.POLYGON,
			});
			return;
		}

		const newState = { activeShape: shape } as any;

		if (this.state.mode !== MODES.SHAPE) {
			newState.mode = MODES.SHAPE;
		}

		this.setState(newState);
	}

	public setCursor = (cursor: 'crosshair' | 'default') => document.body.style.cursor = cursor;

	public handleToolTextClick = () => {
		if (this.state.mode !==  MODES.TEXT) {
			this.setState({ mode: MODES.TEXT }, () => this.setCursor('crosshair'));
		} else {
			this.setState({ mode: '' }, () => this.setCursor('default'));
		}
	}

	private updateProperty = (property: string, value: number) => {
		if (this.state.selectedObjectName) {
			this.props.updateElement(this.state.selectedObjectName, { [property]: value });
		}

		this.setState({ [property]: value });
	}

	public handleBrushSizeChange = ({ target: { value } }) => {
		this.updateProperty('strokeWidth', value);
	}

	public handleTextSizeChange = ({ target: { value } }) => {
		this.updateProperty('fontSize', value);
	}

	public handleColorChange = (color) => this.updateProperty('color', color);

	public renderTools = renderWhenTrue(() => (
		<Tools
			size={this.state.strokeWidth}
			textSize={this.state.fontSize}
			color={this.state.color}
			onDrawClick={this.setBrushMode}
			onEraseClick={this.setEraserMode}
			onTextClick={this.handleToolTextClick}
			onShapeClick={this.setShapeMode}
			onClearClick={this.markupRef.current.clearCanvas}
			onBrushSizeChange={this.handleBrushSizeChange}
			onTextSizeChange={this.handleTextSizeChange}
			onColorChange={this.handleColorChange}
			onUndo={this.props.undo}
			onRedo={this.props.redo}
			onSave={this.handleSave}
			disabled={this.props.disabled}
			mode={this.state.mode}
			activeShape={this.state.activeShape}
			selectedObjectName={this.state.selectedObjectName}
			arePastElements={this.props.arePastElements}
			areFutureElements={this.props.areFutureElements}
		/>
	));

	public renderLoader = renderWhenTrue(() => (
		<LoaderContainer>
			<Loader size={20} />
		</LoaderContainer>
	));

	public render() {
		const { container } = this.state;
		const imgIsLoading = !this.state.sourceImage;

		return (
			<Container height={container.height} width={container.width}>
				{this.renderTools(this.markupRef.current)}
				{this.renderLoader(!this.markupRef.current || imgIsLoading)}
				{!imgIsLoading && (
					<MarkupStage
						sourceImage={this.state.sourceImage}
						disabled={this.props.disabled}

						onScaleStage={this.onScaleStage}
						markupRef={this.markupRef}

						activeShape={this.state.activeShape}
						color={this.state.color}
						selectedObjectName={this.state.selectedObjectName}
						strokeWidth={this.state.strokeWidth as IStrokeWidth}
						mode={this.state.mode}
						fontSize={this.state.fontSize as IFontSize}
						onSelectedObjectNameChange={(selectedObjectName) => this.setState({ selectedObjectName })}
						onModeChange={(mode) => this.setState({ mode })}
						onCursorChange={this.setCursor}
						sizes={this.state.stage}
					/>
				)}
			</Container>
		);
	}
}
