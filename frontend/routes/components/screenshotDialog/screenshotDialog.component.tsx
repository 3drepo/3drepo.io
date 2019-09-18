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
import { Layer, Text, Group, Rect } from 'react-konva';

import { Container, BackgroundImage, Stage, Textarea } from './screenshotDialog.styles';
import { COLOR } from '../../../styles';
import { Drawing } from './components/drawing/drawing.component';
import { Shape } from './components/shape/shape.component';
import { TextNode } from './components/textNode/textNode.component';
import { TransformerComponent } from './components/transformer/transformer.component';
import { Tools } from './components/tools/tools.component';
import { MODES } from './screenshotDialog.helpers';
import { renderWhenTrue } from '../../../helpers/rendering';

const INITIAL_VALUES = {
	color: COLOR.RED,
	brushColor: COLOR.RED,
	brushSize: 20,
	mode: MODES.BRUSH
};

interface IProps {
	sourceImage: string | Promise<string>;
	disabled?: boolean;
	handleResolve: (screenshot) => void;
	handleClose: () => void;
}

export class ScreenshotDialog extends React.PureComponent<IProps, any> {
	public state = {
		color: INITIAL_VALUES.color,
		brushSize: INITIAL_VALUES.brushSize,
		brushColor: INITIAL_VALUES.color,
		mode: INITIAL_VALUES.mode,
		sourceImage: '',
		stage: {
			height: 0,
			width: 0
		},
		objects: [],
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
			const selectedObjectIndex = this.state.objects.findIndex((object) => object.name === this.state.selectedObjectName);
			const updatedObjects = [...this.state.objects];

			updatedObjects[selectedObjectIndex].fontSize = event.target.value;
			newState.objects = updatedObjects;
		}

		this.setState(newState);
	}

	public handleColorChange = (color) => {
		const newState = {} as any;
		newState.color = color;
		newState.brushColor = color;

		if (this.state.selectedObjectName) {
			const selectedObjectIndex = this.state.objects.findIndex((object) => object.name === this.state.selectedObjectName);
			const updatedObjects = [...this.state.objects];

			updatedObjects[selectedObjectIndex].color = color;
			newState.objects = updatedObjects;
		}

		this.setState(newState);
	}

	public clearCanvas = () => {};

	public handleSave = async () => {};

	public setMode = (mode) => { this.setState({ mode }); };

	public setBrushMode = () => {
		this.setMode(MODES.BRUSH);
	}

	public setEraserMode = () => {
		this.setMode(MODES.ERASER);
	}

	public setShapeMode = () => {
		this.setState({ mode: MODES.SHAPE }, () => {
			this.addNewFigure();
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

			if (this.state.lastSelectedObjectName && this.state.objects.length) {
				const updatedObjects = [...this.state.objects];
				const objectIndex = this.state.objects.findIndex((s) => s.name === this.state.lastSelectedObjectName);
				updatedObjects[objectIndex].text = this.state.textEditable.value;

				newState.objects = updatedObjects;
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

			if (this.state.lastSelectedObjectName && this.state.objects.length) {
				const updatedObjects = [...this.state.objects];
				const objectIndex = this.state.objects.findIndex((s) => s.name === this.state.lastSelectedObjectName);
				updatedObjects[objectIndex].text = this.state.textEditable.value;

				newState.objects = updatedObjects;
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
			name: `text-${this.state.objects.length}`,
			fontSize: this.state.brushSize,
			fontFamily: 'Arial'
		};

		this.setState({ objects: [...this.state.objects, newText] });
	}

	public addNewFigure = () => {
		const newFigure = {
			type: 'figure',
			name: `figure-${this.state.objects.length}`,
			width: 200,
			height: 200,
			color: this.state.color,
			x: this.stage.attrs.width / 2 - 200 / 2,
			y: this.stage.attrs.height / 2 - 50
		};

		this.setState({ objects: [...this.state.objects, newFigure] });
	}

	public renderObjects = () => {
		const { textEditable, selectedObjectName } = this.state;

		return (
			<>
				{
					this.state.objects.map((object, index) => {
						const textIndex = `text-${index}`;
						const figureIndex = `figure-${index}`;
						const isSelectedText = selectedObjectName === textIndex;
						const isSelectedFigure = selectedObjectName === figureIndex;
						const isVisible = isSelectedFigure || !(textEditable.visible && isSelectedText);

						const commonProps = {
							object,
							isSelected: object.name === selectedObjectName,
							onSelect: () => {
								this.setState({
									selectedObjectName: object.name
								});
							},
							onChange: (newAttrs) => {
								const objects = this.state.objects.slice();
								objects[index] = newAttrs;
								this.setState({ objects });
							}
						};

						if (object.type === 'text') {
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
							<Shape key={index} {...commonProps} />
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
			onSave={this.handleSave}
			disabled={this.props.disabled}
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

		const object = this.state.objects.find((s) => s.name === target.name());
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

	public render() {
		const { sourceImage, stage, color } = this.state;

		return (
			<Container innerRef={this.containerRef}>
				<BackgroundImage src={sourceImage} />
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
