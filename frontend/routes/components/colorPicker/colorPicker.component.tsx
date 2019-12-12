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

import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import RootRef from '@material-ui/core/RootRef';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';
import { identity, memoize } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';

import Slider from '@material-ui/lab/Slider';
import { CheckboxField } from '../customTable/customTable.component';
import {
	BlockCanvas,
	Canvas,
	CanvasContainer,
	ColorPointer,
	ColorSelect,
	Dot,
	Footer,
	Panel,
	PredefinedColor,
	PredefinedColorsContainer,
	SelectedColor,
	SelectedHash,
	StyledButton,
	StyledIconButton,
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

const isShadeOfGrey = (color: string) => {
	color = color.replace('#', '');
	const r = color.slice(0, 2);
	const g = color.slice(2, 4);
	const b = color.slice(4, 6);

	return r === g && g === b;
};

const getCanvasColor = (event, canvasCtx) => {
	const x = event.offsetX;
	const y = event.offsetY;
	const imageData = canvasCtx.getImageData(x, y, 1, 1).data;
	const rgbaColor = `rgba(${imageData[0]}, ${imageData[1]}, ${imageData[2]}, 1)`;
	return rgbaToHex(rgbaColor).toUpperCase();
};

interface IProps {
	value?: string;
	predefinedColors?: string[];
	onChange?: (color) => void;
	disabled?: boolean;
	disableUnderline?: boolean;
	disableButtons?: boolean;
}

interface IState {
	sliderColor: any;
	open: boolean;
	isDragEnabled: boolean;
	colorHash: string;
	color: string;
	pointerTop?: number;
	pointerLeft?: number;
	hashInput?: string;
	opacity: number;
	opacitySliderVisible: boolean;
}

const OpenFlyoutButton = ({color, onClick, disabled}) =>
	(
		<ColorSelect
			container
			onClick={onClick}
			direction="row"
			alignItems="center"
			justify="flex-start"
			disabled={disabled}
		>
			<Dot item color={color} />
			<Grid item>
				<StyledIconButton aria-label="Toggle picker" disabled={disabled}>
					<ArrowDropDown />
				</StyledIconButton>
			</Grid>
		</ColorSelect>
	);

const PredefinedColors = ({colors, onColorChanged}) => (
		<PredefinedColorsContainer
			container
			direction="row"
			alignItems="center"
			justify="flex-start"
		>
			{
				colors.slice(0, 7).map((color, index) =>
						<PredefinedColor
							item
							key={index}
							color={color}
							onClick={(e) => onColorChanged(color)}
						/>)
			}
		</PredefinedColorsContainer>
);

const ColorSelector = ({baseColor,  selectedColor, onColorChanged}) => {
	const canvasRef = useRef(null);
	const [dragging, setDrag] = useState(false);
	const [colorPosition, setColorPosition] = useState({ x: 0 , y: 0 });

	useEffect(() => {
		const blockCanvas = canvasRef.current as HTMLCanvasElement;

		const ctx = blockCanvas.getContext('2d');
		const width = blockCanvas.width;
		const height = blockCanvas.height;

		if (!isShadeOfGrey(baseColor)) {
			ctx.fillStyle = baseColor;
			ctx.fillRect(0, 0, width, height);

			const whiteGradient = ctx.createLinearGradient(0, 0, width, 0);
			whiteGradient.addColorStop(0, COLORS.WHITE);
			whiteGradient.addColorStop(1, COLORS.WHITE_TRANSPARENT);
			ctx.fillStyle = whiteGradient;
			ctx.fillRect(0, 0, width, height);
		} else {
			ctx.fillStyle = COLORS.WHITE;
			ctx.fillRect(0, 0, width, height);
		}

		const blackGradient = ctx.createLinearGradient(0, 0, 0, height);
		blackGradient.addColorStop(0, COLORS.BLACK_TRANSPARENT);
		blackGradient.addColorStop(1, COLORS.BLACK);
		ctx.fillStyle = blackGradient;
		ctx.fillRect(0, 0, width, height);
	}, [baseColor]);

	const setColor = ({nativeEvent}) => {
		if (!dragging)  { return; }
		const blockCanvas = canvasRef.current as HTMLCanvasElement;
		const ctx = blockCanvas.getContext('2d');
		onColorChanged(getCanvasColor(nativeEvent, ctx));
		setColorPosition({ x: nativeEvent.offsetX, y: nativeEvent.offsetY });
	};

	const onMouseButtonEvent = (drag) => (event) => {
		setColor(event);
		setDrag(drag);
		setColor(event);
	};

	return (
		<CanvasContainer item>
			<Canvas
				ref={canvasRef}
				width={185}
				height={170}
				onMouseDown={onMouseButtonEvent(true)}
				onMouseUp={onMouseButtonEvent(false)}
				onMouseMove={setColor}
			/>
			<ColorPointer style={{top: colorPosition.y, left: colorPosition.x}} />
		</CanvasContainer>
	);
};

const ColorSlider = ({onColorChanged}) => {
	const canvasRef = useRef(null);

	useEffect(() => {
		const stripCanvas = canvasRef.current as HTMLCanvasElement;

		const ctx = stripCanvas.getContext('2d');
		const width = stripCanvas.width;
		const height = stripCanvas.height;
		ctx.rect(0, 0, width, height);

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
	});

	const onClick = (event) => {
		const stripCanvas = canvasRef.current as HTMLCanvasElement;
		const ctx = stripCanvas.getContext('2d');
		const selectedColor = getCanvasColor(event.nativeEvent, ctx);
		onColorChanged(selectedColor);
	};

	return (
		<CanvasContainer item>
			<Canvas
				ref={canvasRef}
				width={23}
				height={170}
				onClick={onClick}
			/>
		</CanvasContainer>
	);
};

const OpacitySlider = ({ opacity, onOpacityChanged, sliderVisible, onSliderVisibilityChanged }) => {
	return (
		<>
		<Grid
			container
			direction="row"
			justify="flex-start"
			alignItems="center"
		>
			<Grid item>
				<CheckboxField onChange={(e, val) => {
					onSliderVisibilityChanged(val);
					if (!val) {
						onOpacityChanged(100);
					}
				}}  />
			</Grid>
			<Grid item>
				Set opacity
			</Grid>
		</Grid>
		{sliderVisible &&
			<Grid
				container
				direction="row"
				justify="flex-start"
				alignItems="center"
			>
				<Grid item >
					<Slider
						style={{width: 100, paddingRight: 5 }}
						value={opacity}
						onChange={(e, val) => onOpacityChanged(val)} />
				</Grid>
				<Grid item>
					{Math.round(opacity)}%
				</Grid>
		</Grid>
		}
	</>
	);
};

export class ColorPicker extends React.PureComponent<IProps, IState> {
	public static defaultProps: IProps = {
		predefinedColors: [],
		onChange: identity,
		disabled: false,
		disableButtons: false
	};

	public state: IState = {
		open: false,
		isDragEnabled: false,
		colorHash: '',
		color: '',
		hashInput: '',
		opacity: 100,
		sliderColor: '',
		opacitySliderVisible: false
	};

	public colorSelectRef = React.createRef();

	public openPanel = (event) => {
		if (!this.props.disabled) {
			this.setState((state) => ({
				open: !state.open
			}));
		}
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

	public renderFooter = () => (
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
	)

	public componentDidUpdate(prevProps, prevState) {
		if (prevState.open !== this.state.open && !this.state.open) {
			if (this.props.disableButtons) {
				this.props.onChange(this.state.colorHash);
			}
			this.handleClose();
		}

		if (prevState.sliderColor !== this.state.sliderColor) {
			this.setState({ colorHash: this.state.sliderColor });
		}

		if (prevState.colorHash !== this.state.colorHash ||
			prevState.opacity !== this.state.opacity ||
			prevState.opacitySliderVisible !== this.state.opacitySliderVisible) {

			this.setState({ hashInput: this.color.replace('#', '')});
		}
	}

	public onPanelOpen = () => {
		this.setColor(this.props.value);
		this.setState({ opacitySliderVisible: (this.props.value.length > 7) });
	}

	public handleHashInputChange = (event) => {
		const color =  event.currentTarget.value;

		this.setState({ hashInput: color }, () => {
			const isValidColor = /(^[0-9A-F]{6}([0-9A-F]{2})?$)/i.test(color.toUpperCase());
			if (isValidColor) {
				this.setState({ sliderColor: '#' + color });
			}
		});
	}

	public setColor = (color) => {
		this.setState({ sliderColor: color});
	}

	get color() {
		const { opacity, opacitySliderVisible, colorHash } = this.state;
		const alphaComponent = opacitySliderVisible ? (Math.round((opacity * 255) / 100)).toString(16).toUpperCase() : '';
		return colorHash +  alphaComponent;
	}

	public render() {
		const {value, predefinedColors, disabled, disableButtons} = this.props;
		const {open, hashInput, colorHash, sliderColor, opacity, opacitySliderVisible} = this.state;

		return (
			<>
				<RootRef rootRef={this.colorSelectRef}>
					<OpenFlyoutButton onClick={this.openPanel} disabled={disabled} color={value} />
				</RootRef>

				<Panel
					open={open}
					anchorEl={this.colorSelectRef.current as HTMLElement}
					onClose={this.handleClose}
					onEnter={this.onPanelOpen}
				>
					{
						predefinedColors.length &&
						<PredefinedColors colors={predefinedColors} onColorChanged={this.setColor} />
					}

					<Grid
						container
						direction="row"
						alignItems="center"
						justify="space-between"
					>
						<ColorSelector
							baseColor={sliderColor}
							selectedColor={colorHash}
							onColorChanged={(color) => this.setState({colorHash: color})} />

						<ColorSlider onColorChanged={this.setColor} />
					</Grid>
					<Grid
						container
						direction="row"
						justify="flex-start"
						alignItems="center"
					>
						<Grid item>
							<SelectedColor color={this.color} />
						</Grid>
						<Grid item>
							<FormControl>
								<SelectedHash
									value={hashInput}
									onChange={this.handleHashInputChange}
									withOpacity={opacitySliderVisible}
									startAdornment={<StyledStartAdornment position="start" disableTypography>#</StyledStartAdornment>}
								/>
							</FormControl>
						</Grid>
					</Grid>
					<OpacitySlider
						opacity={opacity}
						onOpacityChanged={(newOpacity) => this.setState({opacity: newOpacity})}
						sliderVisible={opacitySliderVisible}
						onSliderVisibilityChanged={(visible) => this.setState({opacitySliderVisible: visible})}
					/>
					{!disableButtons && this.renderFooter()}
				</Panel>
			</>
		);
	}
}
