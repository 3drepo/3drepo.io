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

import { Container, Stage, Textarea, BackgroundImage } from './textNode.styles';
import { COLOR } from '../../../../../styles';
import { Drawing } from '../drawing/drawing.component';
import { TransformerComponent } from '../transformer/transformer.component';
import { MODES } from '../../screenshotDialog.helpers';

const Konva = window.Konva;

interface IProps {
	sourceImage: string | Promise<string>;
	disabled?: boolean;
	handleResolve: (screenshot) => void;
	handleClose: () => void;
}

export class Paint extends React.PureComponent<IProps, any> {
	public state = {
		shapes: [],
		selectedShapeName: '',
		lastSelectedShapeName: '',
		textEditable: {
			visible: false,
			value: '',
			styles: {}
		}
	};

	public layerRef = React.createRef<any>();
	public editableTextareaRef = React.createRef<any>();

	public get containerElement() {
		return this.props.containerRef.current;
	}

	public get layer() {
		return this.layerRef.current;
	}

	public get stage() {
		return this.props.stageRef.current;
	}

	public handleBrushSizeChange = (event) => {
		const newState = {} as any;
		newState.brushSize = event.target.value;

		if (this.state.selectedShapeName) {
			const selectedShapeIndex = this.state.shapes.findIndex((shape) => shape.name === this.state.selectedShapeName);
			const updatedShapes = [...this.state.shapes];

			updatedShapes[selectedShapeIndex].fontSize = event.target.value;
			newState.shapes = updatedShapes;
		}

		this.setState(newState);
	}

	public handleColorChange = (color) => {
		const newState = {} as any;

		newState.color = color;
		newState.brushColor = color;

		if (this.state.selectedShapeName) {
			const selectedShapeIndex = this.state.shapes.findIndex((shape) => shape.name === this.state.selectedShapeName);
			const updatedShapes = [...this.state.shapes];

			updatedShapes[selectedShapeIndex].color = color;
			newState.shapes = updatedShapes;
		}

		this.setState(newState);
	}

	public clearCanvas = () => {};

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

		if (target.parent.attrs.rotation) {
			styles.transform = `rotateZ(${target.parent.attrs.rotation}deg)`;
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

			if (this.state.lastSelectedShapeName && this.state.shapes.length) {
				const updatedShapes = [...this.state.shapes];
				const shapeIndex = this.state.shapes.findIndex((s) => s.name === this.state.lastSelectedShapeName);
				updatedShapes[shapeIndex].text = this.state.textEditable.value;

				newState.shapes = updatedShapes;
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

			if (this.state.lastSelectedShapeName && this.state.shapes.length) {
				const updatedShapes = [...this.state.shapes];
				const shapeIndex = this.state.shapes.findIndex((s) => s.name === this.state.lastSelectedShapeName);
				updatedShapes[shapeIndex].text = this.state.textEditable.value;

				newState.shapes = updatedShapes;
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
			color: this.props.color,
			name: `text-${this.state.shapes.length}`,
			width: 300,
			height: 100,
			fontSize: this.props.brushSize
		};

		this.setState({
			shapes: [...this.state.shapes, newText]
		});
	}

	public addNewFigure = () => {
		const newFigure = {
			type: 'figure',
			color: this.props.color,
			name: `figure-${this.state.shapes.length}`,
			width: 200,
			height: 200
		};

		this.setState({
			shapes: [...this.state.shapes, newFigure]
		});
	}

	public renderShapes = () => {
    console.log('render shapes',this.state.shapes)
		return (
			<>
				{this.state.shapes.map((shape, index) => {
					const { color, text, type, width, fontSize, height } = shape;
					const { textEditable, selectedShapeName } = this.state;
					const textIndex = `text-${index}`;
					const figureIndex = `figure-${index}`;
					const isVisible = !(textEditable.visible && selectedShapeName === textIndex || selectedShapeName === figureIndex);

					return (
						<Group key={index}>
							<Group
								name={`group-${index}`}
								x={this.stage.attrs.width / 2 - width / 2}
								y={this.stage.attrs.height / 2 - 50}
								draggable
							>
								{ type === 'text' ?
									<Text
										name={`text-${index}`}
										fontFamily={'Arial'}
										fontSize={fontSize}
										width={width}
										text={text}
										fill={color}
										onDblClick={this.handleTextDoubleClick}
										visible={isVisible}
									/> :
									<Rect
										name={`figure-${index}`}
										width={width}
										height={height}
										stroke={color}
										borderStroke={color}
									/>
								}
							</Group>
							<TransformerComponent
								selectedShapeName={selectedShapeName}
								visible={isVisible}
								shapeType={type}
							/>
						</Group>
					);
				}
				)}
			</>
		);
	}

	public renderDrawing = () => {
		return (
			<Drawing
				height={this.props.height}
				width={this.props.width}
				size={this.props.brushSize}
				color={this.props.brushColor}
				mode={this.props.mode}
			/>
		);
	}

	public renderLayerContent = () => {
		if (this.props.width && this.props.height) {
			return(
				<>
					{this.renderDrawing()}
					{this.renderShapes()}
				</>
			);
		}
	}

	public handleStageMouseDown = ({ target }) => {
		if (target === target.getStage()) {
			this.setState({
				selectedShapeName: ''
			});
			return;
		}

		const clickedOnTransformer = target.getParent().className === 'Transformer';

		if (clickedOnTransformer) {
			return;
		}

		const shape = this.state.shapes.find((s) => s.name === target.name());
		const newState = {} as any;

		const selectedShapeName = shape ? shape.name : '';
		newState.selectedShapeName = selectedShapeName;
		if (selectedShapeName) {
			newState.lastSelectedShapeName = selectedShapeName;
		}

		this.setState(newState);
	}

	public getEditableTextareaStyles = () => {

		return {
			display: this.state.textEditable.visible ? 'block' : 'none',
			...this.state.textEditable.styles
		};
	}

	public render() {
		const { width, height, stageRef, sourceImage } = this.props;

		return (
			<Container>
        <BackgroundImage src={sourceImage} />
				{this.renderTools()}
				<Stage innerRef={stageRef} height={height} width={width} onMouseDown={this.handleStageMouseDown}>
					<Layer ref={this.layerRef}>
						{this.renderLayerContent()}
					</Layer>
				</Stage>
				{this.state.textEditable.value ?
					<Textarea
						name={'editable-textarea'}
						value={this.state.textEditable.value}
						style={this.getEditableTextareaStyles()}
						onChange={this.handleTextEdit}
						onKeyDown={this.handleTextareaKeyDown}
						ref={this.editableTextareaRef}
						rows={4}
						autoFocus
					/> : null
				}
			</Container>
		);
	}
}
