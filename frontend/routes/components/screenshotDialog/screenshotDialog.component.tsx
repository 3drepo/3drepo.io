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

import * as React from 'react';
import { Layer } from 'react-konva';

import { Container, BackgroundImage, Stage, Textarea } from './screenshotDialog.styles';
import { Drawing } from './components/drawing/drawing.component';
import { Shape } from './components/shape/shape.component';
import { TextNode } from './components/textNode/textNode.component';
import { DrawnLine } from './components/drawnLine/drawnLine.component';
import { Tools } from './components/tools/tools.component';
import {
	MODES, ELEMENT_TYPES, INITIAL_VALUES, getNewShape, getNewDrawnLine, getNewText, getTextStyles, EDITABLE_TEXTAREA_NAME
} from './screenshotDialog.helpers';
import { renderWhenTrue } from '../../../helpers/rendering';
import { Indicator } from './components/indicator/indicator.component';

interface IProps {
	sourceImage: string | Promise<string>;
	disabled?: boolean;
	canvasElements: any[];
	arePastElements: boolean;
	areFutureElements: boolean;
	handleResolve: (screenshot) => void;
	handleClose: () => void;
	addElement: (element) => void;
	updateElement: (elementName, property) => void;
	removeElement: (elementName) => void;
	undo: () => void;
	redo: () => void;
	clearHistory: () => void;
}

export class ScreenshotDialog extends React.PureComponent<IProps, any> {
	public state = {
		color: INITIAL_VALUES.color,
		brushSize: INITIAL_VALUES.brushSize,
		brushColor: INITIAL_VALUES.color,
		mode: INITIAL_VALUES.mode,
		activeShape: null,
		sourceImage: '',
		stage: {
			height: 0,
			width: 0
		},
		selectedObjectName: '',
		lastSelectedObjectName: '',
		textEditable: {
			visible: false,
			value: '',
			styles: {}
		} as any
	};

	public containerRef = React.createRef<any>();
	public layerRef = React.createRef<any>();
	public drawingLayerRef = React.createRef<any>();
	public stageRef = React.createRef<any>();
	public editableTextareaRef = React.createRef<any>();

	public get containerElement() {
		return this.containerRef.current;
	}

	public get layer() {
		return this.layerRef.current;
	}

	public get drawingLayer() {
		return this.drawingLayerRef.current;
	}

	public get stage() {
		return this.stageRef.current;
	}

	public get isDrawingMode() {
		return this.state.mode === MODES.BRUSH || this.state.mode === MODES.ERASER;
	}

	public get selectedElementType() {
		const [elementType] = this.state.selectedObjectName.split('-');
		return elementType;
	}

	public setStageSize = () => {
		const height = this.containerElement.offsetHeight;
		const width = this.containerElement.offsetWidth;
		const stage = { height, width };
		this.setState({ stage });
	}

	public async componentDidMount() {
		const sourceImage = await Promise.resolve(this.props.sourceImage);
		this.setState({ sourceImage }, () => {
			this.setStageSize();
		});

		document.addEventListener('keydown', this.handleKeyDown);
	}

	public componentWillUnmount() {
		document.removeEventListener('keydown', this.handleKeyDown);
	}

	public handleBrushSizeChange = (event) => {
		const newState = {} as any;
		newState.brushSize = event.target.value;

		if (this.state.selectedObjectName) {
			const size = event.target.value;
			const changedProperties = {} as any;

			if (this.selectedElementType === ELEMENT_TYPES.TEXT) {
				changedProperties.fontSize = size;
			} else {
				changedProperties.strokeWidth = size;
			}
			this.props.updateElement(this.state.selectedObjectName, changedProperties);
		}

		this.setState(newState);
	}

	public handleColorChange = (color) => {
		const newState = {} as any;
		newState.color = color;
		newState.brushColor = color;

		if (this.state.selectedObjectName) {
			const changedProperties = {} as any;

			if (this.selectedElementType === ELEMENT_TYPES.DRAWING) {
				changedProperties.stroke = color;
			}
			changedProperties.color = color;
			this.props.updateElement(this.state.selectedObjectName, changedProperties);
		}
		this.setState(newState);
	}

	public clearCanvas = () => {
		this.stage.clear();
		this.layer.clear();
		this.drawingLayer.clear();
		this.stage.clearCache();
		this.layer.clearCache();
		this.drawingLayer.clearCache();
		this.layer.destroyChildren();
		this.drawingLayer.destroyChildren();
		this.props.clearHistory();
	}

	public handleUndo = () => {
		this.props.undo();
	}

	public handleRedo = () => {
		this.props.redo();
	}

	public handleSave = async () => {};

	public setBrushMode = () => {
		const newState = {
			mode: this.state.mode === MODES.BRUSH ? '' : MODES.BRUSH
		} as any;

		if (this.state.selectedObjectName) {
			newState.selectedObjectName = '';
		}
		this.setState(newState);
	}

	public setEraserMode = () => {
		const newState = {
			mode: this.state.mode === MODES.ERASER ? '' : MODES.ERASER
		} as any;

		if (this.state.selectedObjectName) {
			newState.selectedObjectName = '';
		}

		this.setState(newState);
	}

	public setShapeMode = (shape) => {
		const newState = {
			activeShape: shape
		} as any;

		if (this.state.mode !== MODES.SHAPE) {
			newState.mode = MODES.SHAPE;
		}

		this.setState(newState, () => {
			this.addNewShape(shape);
		});
	}

	public handleTextDoubleClick = ({target}) => {
		const styles = getTextStyles(target);
		const visible = true;
		const value = target.attrs.text;

		this.setState({
			textEditable: { visible, value, styles }
		}, () => {
			setTimeout(() => {
				window.addEventListener('click', this.handleOutsideClick);
			});
		});
	}

	public handleOutsideClick = (e) => {
		if (e.target.name !== EDITABLE_TEXTAREA_NAME) {
			const newState = {} as any;

			newState.textEditable = {
				...this.state.textEditable,
				visible: false
			};

			if (this.state.lastSelectedObjectName && this.props.canvasElements.length) {
				const text = this.state.textEditable.value;
				this.props.updateElement(this.state.lastSelectedObjectName, { text });
			}

			this.setState(newState, () => {
				setTimeout(() => {
					window.removeEventListener('click', this.handleOutsideClick);
				});
			});
		}
	}

	public handleTextEdit = ({target: {value}}) => {
		const [textAreaWidth] = this.state.textEditable.styles.width.split('px');
		const width = Number(textAreaWidth);

		this.setState({
			textEditable: {
				...this.state.textEditable,
				value,
				styles: {
					...this.state.textEditable.styles,
					width: `${width + width / value.length}px`
				}
			}
		});
	}

	public handleTextareaKeyDown = (e) => {
		if (e.keyCode === 13) {
			const newState = {} as any;

			newState.textEditable = {
				...this.state.textEditable,
				visible: false
			};

			if (this.state.lastSelectedObjectName && this.props.canvasElements.length) {
				const text = this.state.textEditable.value;
				this.props.updateElement(this.state.lastSelectedObjectName, { text });
			}

			this.setState(newState);
		}
	}

	public handleToolTextClick = () => {
		this.setState({ mode: MODES.TEXT }, () => {
			this.addNewText();
		});
	}

	public addNewText = () => {
		const newText = getNewText(this.stage, this.state.color);
		const selectedObjectName = newText.name;
		this.props.addElement(newText);
		this.setState({ selectedObjectName, mode: MODES.TEXT, brushSize: newText.fontSize });
	}

	public addNewDrawnLine = (line) => {
		const newLine = getNewDrawnLine(line.attrs, this.state.color);
		const selectedObjectName = newLine.name;
		this.props.addElement(newLine);
		this.setState({ selectedObjectName, mode: MODES.SHAPE });
	}

	public addNewShape = (figure) => {
		const newShape = getNewShape(this.stage, figure, this.state.color);
		const selectedObjectName = newShape.name;
		this.props.addElement(newShape);
		this.setState({ selectedObjectName, mode: MODES.SHAPE });
	}

	public handleSelectObject = (object) => {
		const newState = {
			selectedObjectName: object.name,
			brushColor: object.color || object.stroke,
			color: object.color || object.stroke,
			mode: object.type
		} as any;

		if (object.fontSize) {
			newState.brushSize = object.fontSize;
		}
		this.setState(newState);
	}

	public handleChangeObject = (index, attrs) => {
		this.props.updateElement(attrs.name, attrs);
	}

	public handleKeyDown = (e) => {
		if (this.state.selectedObjectName && !this.state.textEditable.visible) {
			if (e.keyCode === 8) {
				this.props.removeElement(this.state.selectedObjectName);
				this.setState({
					selectedObjectName: ''
				}, () => {
					document.body.style.cursor = 'default';
				});
			}
		}
	}

	public renderObjects = () => {
		const { textEditable, selectedObjectName } = this.state;

		return (
			<>
				{
					this.props.canvasElements.map((element, index) => {
						const textIndex = `${ELEMENT_TYPES.TEXT}-${index}`;
						const shapeIndex = `${ELEMENT_TYPES.SHAPE}-${index}`;
						const isSelectedText = selectedObjectName === textIndex;
						const isSelectedShape = selectedObjectName === shapeIndex;
						const isVisible = isSelectedShape || !(textEditable.visible && isSelectedText);
						const commonProps = {
							element,
							isSelected: element.name === selectedObjectName,
							handleSelect: () => this.handleSelectObject(element),
							handleChange: (newAttrs) => this.handleChangeObject(index, newAttrs)
						};

						if (element.type === ELEMENT_TYPES.TEXT) {
							return (
								<TextNode
									key={index}
									handleDoubleClick={this.handleTextDoubleClick}
									isVisible={isVisible}
									{...commonProps}
								/>
							);
						} else if (element.type === ELEMENT_TYPES.DRAWING) {
							return(
								<DrawnLine
									key={index}
									isVisible={isVisible}
									{...commonProps}
								/>
							);
						}
						return (
							<Shape key={index} {...commonProps} isDrawingMode={this.isDrawingMode} />
						);
					}
				)}
			</>
		);
	}

	public renderDrawing = () => {
		return (
			<Drawing
				height={this.state.stage.height}
				width={this.state.stage.width}
				size={this.state.brushSize}
				color={this.state.brushColor}
				mode={this.state.mode}
				layer={this.drawingLayerRef}
				stage={this.stage}
				handleNewDrawnLine={this.addNewDrawnLine}
			/>
		);
	}

	public renderLayers = () => {
		if (this.state.stage.width && this.state.stage.height) {
			return (
				<>
					<Layer ref={this.layerRef}>
						{this.renderObjects()}
					</Layer>
					<Layer ref={this.drawingLayerRef}>
						{this.renderDrawing()}
					</Layer>
				</>
			);
		}
	}

	public renderTools = () => (
		<Tools
			size={this.state.brushSize}
			color={this.state.brushColor}
			onDrawClick={this.setBrushMode}
			onEraseClick={this.setEraserMode}
			onTextClick={this.handleToolTextClick}
			onShapeClick={this.setShapeMode}
			onClearClick={this.clearCanvas}
			onBrushSizeChange={this.handleBrushSizeChange}
			onColorChange={this.handleColorChange}
			onCancel={this.props.handleClose}
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
	)

	public handleStageMouseDown = ({ target }) => {
		if (target === target.getStage()) {
			this.setState({ selectedObjectName: '' });
			return;
		}

		const clickedOnTransformer = target.getParent().className === 'Transformer';

		if (clickedOnTransformer) {
			return;
		}

		const object = this.props.canvasElements.find((s) => s.name === target.name());
		const newState = {} as any;

		const selectedObjectName = object ? object.name : '';
		newState.selectedObjectName = selectedObjectName;

		if (selectedObjectName) {
			newState.lastSelectedObjectName = selectedObjectName;
		}

		this.setState(newState);
	}

	public getEditableTextareaStyles = () => {
		return {
			display: this.state.textEditable.visible ? 'block' : 'none',
			...this.state.textEditable.styles
		};
	}

	public renderEditableTextarea = renderWhenTrue(() => (
		<Textarea
			name={EDITABLE_TEXTAREA_NAME}
			value={this.state.textEditable.value}
			style={this.getEditableTextareaStyles()}
			onChange={this.handleTextEdit}
			onKeyDown={this.handleTextareaKeyDown}
			ref={this.editableTextareaRef}
			placeholder={'New text'}
			autoFocus
		/>
	));

	public renderIndicator = renderWhenTrue(() => (
		<Indicator color={this.state.color} size={this.state.brushSize} />
	));

	public render() {
		const { sourceImage, stage } = this.state;

		return (
			<Container innerRef={this.containerRef}>
				<BackgroundImage src={sourceImage} />
				{this.renderIndicator(!this.props.disabled && this.isDrawingMode)}
				{this.renderTools()}
				<Stage innerRef={this.stageRef} height={stage.height} width={stage.width} onMouseDown={this.handleStageMouseDown}>
					{this.renderLayers()}
				</Stage>
				{this.renderEditableTextarea(this.state.textEditable.value)}
			</Container>
		);
	}
}
