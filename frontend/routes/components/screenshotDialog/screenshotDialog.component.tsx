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

import { Container, BackgroundImage, Stage } from './screenshotDialog.styles';
import { COLOR } from '../../../styles';
import { Drawing } from './components/drawing/drawing.component';
import { Tools } from './components/tools/tools.component';
import { MODES } from './screenshotDialog.helpers';

interface IProps {
	sourceImage: string | Promise<string>;
	disabled?: boolean;
	handleResolve: (screenshot) => void;
	handleClose: () => void;
}

export class ScreenshotDialog extends React.PureComponent<IProps, any> {
	public state = {
		color: COLOR.RED,
		brushSize: 5,
		brushColor: COLOR.RED,
		mode: MODES.BRUSH,
		sourceImage: '',
		stage: {
			height: 0,
			width: 0
		}
	};

	public containerRef = React.createRef<any>();

	get containerElement() {
		return this.containerRef.current;
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
		this.setState({ brushSize: event.target.value });
	}

	public handleColorChange = (color) => {
		this.setState({ color, brushColor: color });
	}

	public clearCanvas = () => {};

	public handleSave = async () => {};

	public setMode = (mode) => {
		this.setState({ mode });
	}

	public renderDrawing = (height, width) => {
		if (height && width) {
			return (
				<Drawing
					height={height}
					width={width}
					size={this.state.brushSize}
					color={this.state.brushColor}
					mode={this.state.mode}
				/>
			);
		}
	}

	public renderTools = () => (
		<Tools
			size={this.state.brushSize}
			color={this.state.brushColor}
			onDrawClick={() => this.setMode(MODES.BRUSH)}
			onEraseClick={() => this.setMode(MODES.EARSER)}
			onClearClick={this.clearCanvas}
			onBrushSizeChange={this.handleBrushSizeChange}
			onColorChange={this.handleColorChange}
			onCancel={this.props.handleClose}
			onSave={this.handleSave}
			disabled={this.props.disabled}
		/>
	)

	public render() {
		const { sourceImage, stage, color } = this.state;

		return (
			<Container innerRef={this.containerRef}>
				<BackgroundImage src={sourceImage} />

				{this.renderTools()}

				<Stage height={stage.height} width={stage.width}>
					<Layer>
						{this.renderDrawing(stage.height, stage.width)}
					</Layer>
				</Stage>
			</Container>
		);
	}
}
