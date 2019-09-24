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
import { COLOR } from '../../../styles';
import { Drawing } from './components/drawing/drawing.component';
import { Shape } from './components/shape/shape.component';
import { TextNode } from './components/textNode/textNode.component';
import { Tools } from './components/tools/tools.component';
import { MODES } from './screenshotDialog.helpers';
import { renderWhenTrue } from '../../../helpers/rendering';
import { SHAPE_TYPES } from './components/shape/shape.constants';
import { Indicator } from './components/indicator/indicator.component';

const INITIAL_VALUES = {
	color: COLOR.PRIMARY_DARK,
	brushColor: COLOR.PRIMARY_DARK,
	brushSize: 5,
	mode: MODES.BRUSH
};

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
		}
	};

	public containerRef = React.createRef<any>();
	public layerRef = React.createRef<any>();
	public stageRef = React.createRef<any>();
	public editableTextareaRef = React.createRef<any>();

	public get containerElement() {
		return this.containerRef.current;
	}

	public get layer() {
		return this.layerRef.current;
	}

	public get stage() {
		return this.stageRef.current;
	}

	public get isDrawingMode() {
		return this.state.mode === MODES.BRUSH || this.state.mode === MODES.ERASER;
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

	}

	public handleBrushSizeChange = (event) => {
		const newState = {} as any;
		newState.brushSize = event.target.value;

		if (this.state.selectedObjectName) {
			const fontSize = event.target.value;
			this.props.updateElement(this.state.selectedObjectName, { fontSize });
		}

		this.setState(newState);
	}

	public handleColorChange = (color) => {
		const newState = {} as any;
		newState.color = color;
		newState.brushColor = color;

		if (this.state.selectedObjectName) {
			this.props.updateElement(this.state.selectedObjectName, { color });
		}

		this.setState(newState);
	}

	public clearCanvas = () => {
		this.stage.clear();
		this.layer.clear();
		this.stage.clearCache();
		this.layer.clearCache();
		this.layer.destroyChildren();
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
		const textPosition = target.getAbsolutePosition();
		const styles = {
			color: target.attrs.fill,
			fontSize: target.attrs.fontSize,
			fontFamily: target.attrs.fontFamily,
			width: `${target.width() - target.padding() * 2}px`,
			height: `${target.height() - target.padding() * 2}px`,
			textAlign: target.align(),
			lineHeight: target.lineHeight(),
			top: `${textPosition.y - 2}px`,
			left: `${textPosition.x}px`
		} as any;

		if (target.attrs.rotation) {
			styles.transform = `rotateZ(${target.attrs.rotation}deg)`;
		}

		this.setState({
			textEditable: {
				visible: true,
				value: target.attrs.text,
				styles
			}
		}, () => {
			setTimeout(() => {
				window.addEventListener('click', this.handleOutsideClick);
			});
		});
	}

	public handleOutsideClick = (e) => {
		if (e.target.name !== 'editable-textarea') {
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

	public handleTextEdit = (e) => {
		this.setState({
			textEditable: {
				...this.state.textEditable,
				value: e.target.value
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
		const newText = {
			type: 'text',
			text: 'New text',
			color: this.state.color,
			name: `text-${this.props.canvasElements.length}`,
			fontSize: 20,
			fontFamily: 'Arial',
			x: this.stage.attrs.width / 2 - 200 / 2,
			y: this.stage.attrs.height / 2 - 50
		};

		this.props.addElement(newText);

		this.setState({
			selectedObjectName: newText.name,
			mode: MODES.TEXT,
			brushSize: newText.fontSize
		});
	}

	public addNewShape = (figure) => {
		const newShape = {
			type: 'shape',
			figure,
			name: `shape-${this.props.canvasElements.length}`,
			width: 200,
			height: 200,
			color: this.state.color,
			x: this.stage.attrs.width / 2 - 200 / 2,
			y: this.stage.attrs.height / 2 - 50,
			rotation: 0
		};

		if (figure === SHAPE_TYPES.LINE) {
			newShape.height = 0;
			newShape.width = 300;
		} else if (figure === SHAPE_TYPES.CLOUD) {
			newShape.height = 150;
			newShape.width = 264;
		}

		this.props.addElement(newShape);

		this.setState({
			selectedObjectName: newShape.name,
			mode: MODES.SHAPE
		}, () => {
			console.log('element', this.props.canvasElements.find((el) => el.name === newShape.name));
			console.log('active!', newShape.name);
		});
	}

	public handleSelectObject = (object) => {
			const newState = {
				selectedObjectName: object.name,
				brushColor: object.color,
				color: object.color,
				mode: MODES.SHAPE
			} as any;

			if (object.fontSize) {
				newState.brushSize = object.fontSize;
			}
			this.setState(newState);
	}

	public handleChangeObject = (index, attrs) => {
		console.log('attrs', attrs);
		this.props.updateElement(attrs.name, attrs);
	}

	public renderObjects = () => {
		const { textEditable, selectedObjectName } = this.state;

		return (
			<>
				{
					this.props.canvasElements.map((element, index) => {
						const textIndex = `text-${index}`;
						const shapeIndex = `shape-${index}`;
						const isSelectedText = selectedObjectName === textIndex;
						const isSelectedShape = selectedObjectName === shapeIndex;
						const isVisible = isSelectedShape || !(textEditable.visible && isSelectedText);

						const commonProps = {
							element,
							isSelected: element.name === selectedObjectName,
							handleSelect: () => this.handleSelectObject(element),
							handleChange: (newAttrs) => this.handleChangeObject(index, newAttrs)
						};

						if (element.type === 'text') {
							return (
								<TextNode
									key={index}
									handleDoubleClick={this.handleTextDoubleClick}
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
				layer={this.layerRef}
				stage={this.stage}
			/>
		);
	}

	public renderLayerContent = () => {
		const { stage } = this.state;

		if (stage.width && stage.height) {
			return(
				<>
					{this.renderDrawing()}
					{this.renderObjects()}
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
			activeShape={this.state.activeShape}
			selectedObjectName={this.state.selectedObjectName}
			arePastElements={this.props.arePastElements}
			areFutureElements={this.props.areFutureElements}
		/>
	)

	public handleStageMouseDown = ({ target }) => {
		if (target === target.getStage()) {
			this.setState({
				selectedObjectName: ''
			});
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
			name={'editable-textarea'}
			value={this.state.textEditable.value}
			style={this.getEditableTextareaStyles()}
			onChange={this.handleTextEdit}
			onKeyDown={this.handleTextareaKeyDown}
			ref={this.editableTextareaRef}
			autoFocus
		/>
	));

	public renderIndicator = renderWhenTrue(() => (
		<Indicator color={this.state.color} size={this.state.brushSize} />
	));

	public render() {
		const { sourceImage, stage } = this.state;
		console.log('render elements', this.props.canvasElements);

		return (
			<Container innerRef={this.containerRef}>
				<BackgroundImage src={sourceImage} />
				{this.renderIndicator(!this.props.disabled && this.isDrawingMode)}
				{this.renderTools()}
				<Stage innerRef={this.stageRef} height={stage.height} width={stage.width} onMouseDown={this.handleStageMouseDown}>
					<Layer ref={this.layerRef}>
						{this.renderLayerContent()}
					</Layer>
				</Stage>
				{this.renderEditableTextarea(this.state.textEditable.value)}
			</Container>
		);
	}
}
