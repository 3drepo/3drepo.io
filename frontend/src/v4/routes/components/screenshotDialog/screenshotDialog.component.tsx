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
/* eslint-disable max-classes-per-file */

import { PureComponent, createRef } from 'react';

import { CALLOUTS, IFontSize, IStrokeWidth, SHAPES } from '@components/shared/modalsDispatcher/templates/imagesModal/imageMarkup/imageMarkup.types';
import { viewportSize } from '@/v4/helpers/viewportSize';
import { aspectRatio } from '@/v4/helpers/aspectRatio';
import { MarkupToolbar } from '@components/shared/modalsDispatcher/templates/imagesModal/imageMarkup/markupToolbar/markupToolbar.component';
import { renderWhenTrue } from '../../../helpers/rendering';
import { LoaderContainer } from '../../board/board.styles';
import { Loader } from '../loader/loader.component';
import { INITIAL_VALUES } from './screenshotDialog.helpers';
import { MODES } from './markupStage/markupStage.helpers';
import { Container, MarkupToolbarContainer } from './screenshotDialog.styles';
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
		activeShape: SHAPES.RECTANGLE,
		callout: CALLOUTS.RECTANGLE,
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

	public setCursor = (cursor: 'crosshair' | 'default') => document.body.style.cursor = cursor;

	private updateProperty = (property: string, value: number) => {
		if (this.state.selectedObjectName) {
			this.props.updateElement(this.state.selectedObjectName, { [property]: value });
		}

		this.setState({ [property]: value });
	}

	public handleBrushSizeChange = (value) => this.updateProperty('strokeWidth', value);
	public handleTextSizeChange = (value) => this.updateProperty('fontSize', value);
	public handleColorChange = (value) => this.updateProperty('color', value);

	public handleModeChange = (newMode) => {
		const newState = {} as any;
		if (this.state.selectedObjectName) {
			newState.selectedObjectName = '';
		}

		newState.mode = newMode;
		this.setState(newState);
	};

	public handleCalloutChange = (newCallout) => {
		this.setState({
			callout: newCallout,
			mode: MODES.CALLOUT,
		})
	};

	public handleShapeChange = (newShape) => {
		if (newShape === SHAPES.POLYGON) {
			this.setState({ activeShape: newShape, mode: MODES.POLYGON});
			return;
		}

		if (this.state.mode !== MODES.SHAPE) {
			this.setState({ activeShape: newShape, mode: MODES.SHAPE});
			return;
		}

		this.setState({ activeShape: newShape });
	};

	public renderTools = renderWhenTrue(() => (
		<MarkupToolbarContainer>
			<MarkupToolbar
				onSave={this.handleSave}
				shape={this.state.activeShape}
				color={this.state.color}
				selectedObjectName={this.state.selectedObjectName}
				strokeWidth={this.state.strokeWidth as IStrokeWidth}
				mode={this.state.mode}
				fontSize={this.state.fontSize as IFontSize}
				callout={this.state.callout}
				onClearClick={this.markupRef.current.clearCanvas}
				onStrokeWidthChange={this.handleBrushSizeChange}
				onFontSizeChange={this.handleTextSizeChange}
				onColorChange={this.handleColorChange}
				onShapeChange={this.handleShapeChange}
				onModeChange={this.handleModeChange}
				onCalloutChange={this.handleCalloutChange}
				allowSaveWithoutChanges
			/>
		</MarkupToolbarContainer>
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
				{this.renderTools(this.markupRef.current && !this.props.disabled)}
				{this.renderLoader(!this.markupRef.current || imgIsLoading)}
				{!imgIsLoading && (
					<MarkupStage
						sourceImage={this.state.sourceImage}
						disabled={this.props.disabled}

						onScaleStage={this.onScaleStage}
						markupRef={this.markupRef}

						activeShape={this.state.mode === MODES.SHAPE ? this.state.activeShape : this.state.callout}
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
