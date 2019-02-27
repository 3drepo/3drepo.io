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
import { memoize, identity } from 'lodash';
import RootRef from '@material-ui/core/RootRef';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';

import {
	Panel,
	Dot,
	ColorSelect,
	StyledIconButton,
	BlockCanvas,
	StripCanvas,
	Footer,
	CanvasContainer,
	ColorPointer,
	StyledButton,
	PredefinedColorsContainer,
	PredefinedColor,
	SelectedColor,
	SelectedHash,
	StyledStartAdornment
} from './colorPicker.styles';

const COLORS = {
	RED: 'rgba(255,0,0,1)',
	GREEN: 'rgba(0, 255, 0, 1)',
	SKY_BLUE: 'rgba(0, 255, 255, 1)',
	BLUE: 'rgba(0, 0, 255, 1)',
	YELLOW: 'rgba(255, 255, 0, 1)',
	PURPLE: 'rgba(255, 0, 255, 1)',
	BLACK: 'rgba(0,0,0,1)',
	BLACK_TRANSPARENT: 'rgba(0,0,0,0)',
	WHITE: 'rgba(255,255,255,1)',
	WHITE_TRANSPARENT: 'rgba(255,255,255,0)'
};

const componentToHex = memoize((c) => {
	const hex = c.toString(16);
	return hex.length === 1 ? '0' + hex : hex;
});

const rgbaToHex = memoize((rgbaColor) => {
	const [r, g, b] = rgbaColor.match(/[.\d]+/g).map(Number);
	return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
});

const hexToRgba = memoize((hex) => {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.toLowerCase());

	return result
		? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, 1)`
		: COLORS.BLACK;
});

const findColorPositionOnCanvas = (canvas, colorHash): { x: number, y: number } => {
	const ctx = canvas.getContext('2d');
	const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
	const rgbaColor = hexToRgba(colorHash);

	const position = { x: 0, y: 0 };
	for (let i = 0; i < data.length; i += 4) {
		const isSameColor = `rgba(${data[i]}, ${data[i + 1]}, ${data[i + 2]}, 1)` === rgbaColor;
		if (isSameColor) {
			position.x = i / 4 % canvas.width;
			position.y = (i / 4 - position.x) / canvas.width;
			break;
		}
	}
	return position;
};

const getColorObject = (colorHash = '') => {
	const colorValue = colorHash.replace('#', '');
	return {
		colorHash: `${colorHash}`,
		color: colorValue,
		hashInput: colorValue
	};
};

interface IProps {
	value?: string;
	predefinedColors?: string[];
	onChange?: (color) => void;
	disableUnderline?: boolean;
}

interface IState {
	open: boolean;
	isDragEnabled: boolean;
	colorHash: string;
	color: string;
	pointerTop?: number;
	pointerLeft?: number;
	hashInput?: string;
}

export class ColorPicker extends React.PureComponent<IProps, IState> {
	public static defaultProps: IProps = {
		predefinedColors: [],
		onChange: identity
	};

	public state: IState = {
		open: false,
		isDragEnabled: false,
		colorHash: '',
		color: '',
		hashInput: ''
	};

	public colorSelectRef = React.createRef();
	public blockCanvasRef = React.createRef<HTMLElement>();
	public stripCanvasRef = React.createRef<HTMLElement>();
	public pointerRef = React.createRef<HTMLElement>();

	public handleClick = (event) => {
		this.setState((state) => ({
			open: !state.open
		}));
	}

	public handleClose = () => {
		this.setState({
			open: false
		});
	}

	public handleSave = () => {
		this.props.onChange(this.state.colorHash);
		this.handleClose();
	}

	public componentDidUpdate(prevProps, prevState) {
		if (prevState.open !== this.state.open && !this.state.open) {
			this.handleClose();
		}
	}

	public onPanelOpen = () => {
		this.setColor(this.props.value, () => {
			this.initialiseBlockCanvas(this.state.colorHash);
			this.initialiseStripCanvas();
		});
	}

	public setColor = (colorHash, callback?) => {
		const updatedColors = getColorObject(colorHash);
		this.setState(updatedColors, callback);
	}

	public setBlockColorPointerPosition(x, y): void {
		this.setState({
			pointerLeft: x,
			pointerTop: y
		});
	}

	public initialiseBlockCanvas(colorHash): void {
		const blockCanvas = this.blockCanvasRef.current as HTMLCanvasElement;
		const ctx = blockCanvas.getContext('2d');
		const width = blockCanvas.width;
		const height = blockCanvas.height;
		const x = 0;
		const y = 0;
		const drag = false;

		ctx.rect(0, 0, width, height);
		this.fillBlockCanvas(colorHash);

		const colorPosition = findColorPositionOnCanvas(blockCanvas, colorHash);
		this.setBlockColorPointerPosition(colorPosition.x, colorPosition.y);
	}

	public fillBlockCanvas(color): void {
		const blockCanvas = this.blockCanvasRef.current as HTMLCanvasElement;

		const ctx = blockCanvas.getContext('2d');
		const width = blockCanvas.width;
		const height = blockCanvas.height;
		ctx.fillStyle = color;
		ctx.fillRect(0, 0, width, height);

		const whiteGradient = ctx.createLinearGradient(0, 0, width, 0);
		whiteGradient.addColorStop(0, COLORS.WHITE);
		whiteGradient.addColorStop(1, COLORS.WHITE_TRANSPARENT);
		ctx.fillStyle = whiteGradient;
		ctx.fillRect(0, 0, width, height);

		const blackGradient = ctx.createLinearGradient(0, 0, 0, height);
		blackGradient.addColorStop(0, COLORS.BLACK_TRANSPARENT);
		blackGradient.addColorStop(1, COLORS.BLACK);
		ctx.fillStyle = blackGradient;
		ctx.fillRect(0, 0, width, height);
	}

	public initialiseStripCanvas(): void {
		const stripCanvas = this.stripCanvasRef.current as HTMLCanvasElement;

		const ctx = stripCanvas.getContext('2d');
		const width = stripCanvas.width;
		const height = stripCanvas.height;
		ctx.rect(0, 0, width, height);

		this.fillStripCanvas();
	}

	public fillStripCanvas(): void {
		const stripCanvas = this.stripCanvasRef.current as HTMLCanvasElement;

		const ctx = stripCanvas.getContext('2d');
		const width = stripCanvas.width;
		const height = stripCanvas.height;

		const gradient = ctx.createLinearGradient(0, 0, 0, height);
		gradient.addColorStop(0, COLORS.RED);
		gradient.addColorStop(0.17, COLORS.YELLOW);
		gradient.addColorStop(0.34, COLORS.GREEN);
		gradient.addColorStop(0.51, COLORS.SKY_BLUE);
		gradient.addColorStop(0.68, COLORS.BLUE);
		gradient.addColorStop(0.85, COLORS.PURPLE);
		gradient.addColorStop(1, COLORS.RED);

		ctx.fillStyle = gradient;
		ctx.fill();
	}

	public onStripCanvasClick = (event): void => {
		const stripCanvas = this.stripCanvasRef.current as HTMLCanvasElement;
		const ctx = stripCanvas.getContext('2d');
		this.onSelectedImageDataChange(event.nativeEvent, ctx, true);
	}

	public onBlockCanvasClick = (dragState, event): void => {
		this.state.isDragEnabled = dragState;

		if (dragState) {
			this.onBlockCanvasMove(event);
		}
	}

	public onBlockCanvasMove = (event): void => {
		if (this.state.isDragEnabled) {
			const blockCanvas = this.blockCanvasRef.current as HTMLCanvasElement;
			const ctx = blockCanvas.getContext('2d');
			this.onSelectedImageDataChange(event.nativeEvent, ctx);
		}
	}

	public onSelectedImageDataChange(event, canvasCtx, shouldRefreshCanvas = false) {
		const x = event.offsetX;
		const y = event.offsetY;
		const imageData = canvasCtx.getImageData(x, y, 1, 1).data;
		const rgbaColor = `rgba(${imageData[0]}, ${imageData[1]}, ${imageData[2]}, 1)`;

		this.onColorHashChange(rgbaToHex(rgbaColor).toUpperCase().replace('#', ''), { x, y }, shouldRefreshCanvas);
	}

	public onColorHashChange = (color = this.state.color, position?, shouldRefreshCanvas = false): void => {
		const isValidColor = /(^[0-9A-F]{6}$)/i.test(color.toUpperCase());
		const blockCanvas = this.blockCanvasRef.current as HTMLCanvasElement;

		if (isValidColor) {
				this.setColor(`#${color}`, () => {
					if (!position || shouldRefreshCanvas) {
						this.fillBlockCanvas(this.state.colorHash);
					}

					const colorBlockPosition = position || findColorPositionOnCanvas(blockCanvas, this.state.colorHash);
					this.setBlockColorPointerPosition(colorBlockPosition.x, colorBlockPosition.y);
				});
		}
	}

	public onPredefinedColorClick = (predefinedColor) => () => {
		this.onColorHashChange(predefinedColor.toUpperCase().replace('#', ''));
	}

	public renderPredefinedColors = (colors) => {
		return colors.slice(0, 7).map((color, index) => {
			return (
				<PredefinedColor
					item={true}
					key={index}
					color={color}
					onClick={this.onPredefinedColorClick(color)}
				/>
			);
		});
	}

	public handleHashInputChange = (event) => {
		this.setState({ hashInput: event.currentTarget.value }, () => {
			this.onColorHashChange(this.state.hashInput);
		});
	}

	public render() {
		const {value, predefinedColors} = this.props;
		const {open, pointerLeft, pointerTop, colorHash, color, hashInput} = this.state;

		return (
			<>
				<RootRef rootRef={this.colorSelectRef}>
					<ColorSelect
						container={true}
						onClick={this.handleClick}
						direction="row"
						alignItems="center"
						justify="flex-start"
					>
						<Dot item={true} color={value} />
						<Grid item={true}>
							<StyledIconButton aria-label="Toggle picker">
								<ArrowDropDown />
							</StyledIconButton>
						</Grid>
					</ColorSelect>
				</RootRef>

				<Panel
					open={open}
					anchorEl={this.colorSelectRef.current as HTMLElement}
					onClose={this.handleClose}
					onEnter={this.onPanelOpen}
				>
					{
						predefinedColors.length ? (
							<PredefinedColorsContainer
								container={true}
								direction="row"
								alignItems="center"
								justify="flex-start"
							>
								{this.renderPredefinedColors(predefinedColors)}
							</PredefinedColorsContainer>
						) : null
					}
					<Grid
						container={true}
						direction="row"
						alignItems="center"
						justify="space-between"
					>
						<CanvasContainer item={true}>
							<BlockCanvas
								innerRef={this.blockCanvasRef}
								width={185}
								height={170}
								onMouseDown={this.onBlockCanvasClick.bind(null, true)}
								onMouseUp={this.onBlockCanvasClick.bind(null, false)}
								onMouseMove={this.onBlockCanvasMove}
							/>
							<ColorPointer
								innerRef={this.pointerRef}
								style={{
									top: pointerTop,
									left: pointerLeft
								}}
							/>
						</CanvasContainer>
						<CanvasContainer item={true}>
							<StripCanvas
								innerRef={this.stripCanvasRef}
								width={23}
								height={170}
								onClick={this.onStripCanvasClick}
							/>
						</CanvasContainer>
					</Grid>
					<Grid
						container={true}
						direction="row"
						justify="flex-start"
						alignItems="center"
					>
						<Grid item={true}>
							<SelectedColor color={colorHash} />
						</Grid>
						<Grid item={true}>
							<FormControl>
								<SelectedHash
									value={hashInput}
									onChange={this.handleHashInputChange}
									startAdornment={<StyledStartAdornment position="start" disableTypography={true}>#</StyledStartAdornment>}
								/>
							</FormControl>
						</Grid>
					</Grid>
					<Footer>
						<StyledButton
							variant="raised"
							color="secondary"
							onClick={this.handleSave}
						>
							Save
						</StyledButton>
						<StyledButton
							color="primary"
							onClick={this.handleClose}
						>
							Cancel
						</StyledButton>
					</Footer>
				</Panel>
			</>
		);
	}
}
