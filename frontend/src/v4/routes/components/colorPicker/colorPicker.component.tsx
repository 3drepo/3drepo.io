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

import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';

import ArrowDropDown from '@mui/icons-material/ArrowDropDown';
import { identity } from 'lodash';
import { PureComponent, useEffect, useRef, useState, createRef } from 'react';

import { componentToHex, hexToGLColor, GLToHexColor, rgbToHex } from '@/v5/helpers/colors.helper';
import {
	Canvas,
	CanvasContainer,
	ColorPointer,
	ColorSelect,
	Dot,
	Footer,
	OpacityInput,
	OpacityInputAdornment,
	OpacitySlider,
	OpacityValue,
	OpacityVisibilityCheckbox,
	Panel,
	PredefinedColor,
	PredefinedColorsContainer,
	SelectedColor,
	SelectedColorBackground,
	SelectedHash,
	StyledAdornment,
	StyledButton,
	StyledIconButton
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

const VALID_COLOR_RE =  /(^#[0-9A-F]{6}$)/i; // TODO all these color functions?
const VALID_COLOR_ALPHA_RE =  /(^#[0-9A-F]{6}([0-9A-F]{2})?$)/i;

const isShadeOfGrey = (color: string) => {
	color = color.replace('#', '');
	const r = color.slice(0, 2);
	const g = color.slice(2, 4);
	const b = color.slice(4, 6);

	return r === g && g === b;
};

const getAlphaHex = (color) => color.slice(7);

const getAlpha = (color: string) => parseInt(getAlphaHex(color) || 'ff', 16);

const stripAlpha =  (color) => color.slice(0, 7);

const alphaToHex = (val) => componentToHex(Math.round(val));

const getCanvasColor = (event, canvasCtx) => {
	const x = event.offsetX;
	const y = event.offsetY;
	const [r, g, b] = canvasCtx.getImageData(x, y, 1, 1).data;
	return rgbToHex([r, g, b]);
};

interface IProps {
	value?: string | number[];
	predefinedColors?: string[];
	onChange?: (color) => void;
	disabled?: boolean;
	disableUnderline?: boolean;
	disableButtons?: boolean;
	opacityEnabled?: boolean;
	onOpen?: () => void;
	onClose?: () => void;
}

interface IState {
	baseColor: any;
	open: boolean;
	isDragEnabled: boolean;
	selectedColor: string;
	pointerTop?: number;
	pointerLeft?: number;
	hashInput?: string;
	opacity: number;
	opacitySliderVisibility: boolean;
}

const OpenPanelButton = ({color, onClick, disabled, colorSelectRef}) =>
	(
		<ColorSelect
			container
			onClick={onClick}
			direction="row"
			alignItems="center"
			justifyContent="flex-start"
			disabled={disabled}
			ref={colorSelectRef}
		>
			<Dot item color={color} />
			<Grid item>
				<StyledIconButton aria-label="Toggle picker" disabled={disabled}>
					<ArrowDropDown />
				</StyledIconButton>
			</Grid>
		</ColorSelect>
	);

const PredefinedColors = ({colors, onChange}) => (
		<PredefinedColorsContainer
			container
			direction="row"
			alignItems="center"
			justifyContent="flex-start"
		>
			{
				colors.slice(0, 7).map((color, index) =>
						<PredefinedColor
							item
							key={index}
							color={color}
							onClick={(e) => onChange(color)}
						/>)
			}
		</PredefinedColorsContainer>
);

const ColorSquareSelector = ({value, onChange}) => {
	const canvasRef = useRef(null);
	const [dragging, setDrag] = useState(false);
	const [colorPosition, setColorPosition] = useState({ left: 0 , top: 0 });

	useEffect(() => {
		const blockCanvas = canvasRef.current as HTMLCanvasElement;

		const ctx = blockCanvas.getContext('2d');
		const width = blockCanvas.width;
		const height = blockCanvas.height;

		if (!isShadeOfGrey(value)) {
			ctx.fillStyle = value;
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
		setColorPosition({ left: 0, top: 0 });
	}, [value]);

	const setColor = ({nativeEvent}) => {
		if (!dragging)  {
 			return;
		}
		const blockCanvas = canvasRef.current as HTMLCanvasElement;
		const ctx = blockCanvas.getContext('2d');
		onChange(getCanvasColor(nativeEvent, ctx));
		setColorPosition({ left: nativeEvent.offsetX, top: nativeEvent.offsetY });
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
			<ColorPointer style={colorPosition} />
		</CanvasContainer>
	);
};

const ColorSlider = ({ onChange }) => {
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
		onChange(selectedColor);
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

const ColorSample = ({color}) => {
	return (
		<>
			<SelectedColorBackground />
			<SelectedColor color={color} />
		</>
	);
};

const OpacityControl = ({ opacity, onOpacityChanged, sliderVisible, onSliderVisibilityChanged }) => {
	const [inputVal, setInputVal] = useState(opacity);

	const toPercentage = (alpha) => Math.ceil(opacity / 2.55);

	useEffect(() => {
		setInputVal(toPercentage(opacity));
	},  [opacity]);

	const setValidOpacity = (e) => {
		const val = Math.min(Math.max(Number(e.target.value) || 1, 1), 100) * 2.55;
		onOpacityChanged(val);
		return val;
	};

	const onInputBlur = (e) => {
		const val = setValidOpacity(e);
		setInputVal(toPercentage(val));
	};

	const onInputChanged = (e) => {
		const val = e.target.value;
		const numVal = parseInt(val, 10);
		setInputVal(val);

		if (!isNaN(numVal) &&  numVal >= 0 && numVal <= 100) {
			setValidOpacity(e);
		}
	};

	return <>
		<Grid
			container
			direction="row"
			justifyContent="flex-start"
			alignItems="center"
		>
			<Grid item>
				<OpacityVisibilityCheckbox onChange={(e, val) => onSliderVisibilityChanged(val)} checked={sliderVisible} />
			</Grid>
			<Grid item>
				Set Opacity
			</Grid>
		</Grid>
		{sliderVisible &&
			<Grid
				container
				direction="row"
				justifyContent="flex-start"
				alignItems="center"
			>
				<Grid item>
					<OpacitySlider
						max={255}
						min={1}
						value={opacity}
						onChange={(e, val) => onOpacityChanged(val)}
					/>
				</Grid>
				<Grid item>
					<OpacityValue>
						<OpacityInput
							value={inputVal}
							endAdornment={<OpacityInputAdornment position="end" disableTypography>%</OpacityInputAdornment>}
							inputProps={{
								'step': 10,
								'min': 0,
								'max': 100,
								'type': 'number',
								'aria-labelledby': 'input-slider',
							}}
							margin="dense"
							onChange={onInputChanged}
							onBlur={onInputBlur}
						/>
					</OpacityValue>
				</Grid>
			</Grid>
		}
	</>;
};

export class ColorPicker extends PureComponent<IProps, IState> {
	public static defaultProps: IProps = {
		predefinedColors: [],
		onChange: identity,
		disabled: false,
		disableButtons: false,
		opacityEnabled: false
	};

	public state: IState = {
		open: false,
		isDragEnabled: false,
		selectedColor: '',
		hashInput: '',
		opacity: 100,
		baseColor: '',
		opacitySliderVisibility: false
	};

	public colorSelectRef = createRef();

	public openPanel = (event) => {
		if (!this.props.disabled) {
			this.setState((state) => ({
				open: !state.open
			}));
		}
	}

	public handleClose = () => {
		if (this.props.onClose) {
			this.props.onClose();
		}

		this.setState({
			open: false,
		});
	}

	public handleSave = () => {
		const value = Array.isArray(this.props.value) ?  hexToGLColor(this.state.selectedColor) : this.state.selectedColor;
		this.props.onChange(value);
		this.handleClose();
	}

	public renderFooter = () => (
		<Footer>
			<StyledButton
				variant="contained"
				color={'primary'}
				onClick={this.handleSave}
			>
				Save
			</StyledButton>
			<StyledButton
				color="secondary"
				variant="outlined"
				onClick={this.handleClose}
			>
				Cancel
			</StyledButton>
		</Footer>
	)

	public componentDidUpdate(prevProps, prevState) {
		if (prevState.open !== this.state.open && !this.state.open) {
			if (this.props.disableButtons) {
				this.props.onChange(this.state.selectedColor);
			}
			this.handleClose();
		}
	}

	get hexValue() {
		return (Array.isArray(this.props.value) ? GLToHexColor(this.props.value) : this.props.value) || '';
	}

	public onPanelOpen = () => {
		const value = this.hexValue;

		if (this.props.onOpen) {
			this.props.onOpen();
		}

		this.setState({
			baseColor: stripAlpha(value),
			opacitySliderVisibility: (value.length > 7),
			opacity: getAlpha(value),
			selectedColor: value,
			hashInput: value
		});
	}

	public handleHashInputChange = (event) => {
		const color =  '#' + event.currentTarget.value;
		let newState: any = { hashInput: color };

		const isValidColor = (this.props.opacityEnabled ? VALID_COLOR_ALPHA_RE : VALID_COLOR_RE).test(color.toUpperCase());
		if (isValidColor) {
			const opacity = getAlpha(color);
			const opacitySliderVisibility = Boolean(opacity) && !(opacity === 255);
			newState = {...newState, opacity, opacitySliderVisibility, baseColor: stripAlpha(color),  selectedColor: color};
			newState = {...newState, selectedColor: this.withOpacity(newState) };
		}

		this.setState(newState);
	}

	public getSelectedColorObject = (state) => {
		const selectedColor = this.withOpacity(state);
		const newState = ({selectedColor, hashInput: selectedColor});
		return newState;
	}

	public withOpacity = ({selectedColor, opacitySliderVisibility, opacity}) => {
		if (!this.props.opacityEnabled) {
 			return selectedColor;
		}
		return stripAlpha(selectedColor) + (opacitySliderVisibility ? alphaToHex(opacity) : '');
	}

	public setBaseColor = (color) => {
		this.setState({ baseColor: color,  ...this.getSelectedColorObject({...this.state,  selectedColor: color}) });
	}

	public setSelectedColor = (color) => {
		this.setState(this.getSelectedColorObject({...this.state,  selectedColor: color}));
	}

	public setOpacity = (opacity) => {
		this.setState({ opacity, ...this.getSelectedColorObject({...this.state,  opacity}) });
	}

	public setOpacityVisibility = (opacitySliderVisibility) => {
		this.setState({ opacitySliderVisibility, ...this.getSelectedColorObject({...this.state,  opacitySliderVisibility}) });
	}

	public render() {
		const {predefinedColors, disabled, disableButtons, opacityEnabled} = this.props;
		const {open, hashInput, selectedColor, baseColor, opacity, opacitySliderVisibility} = this.state;

		return <>
            <>
                <OpenPanelButton
					onClick={this.openPanel}
					disabled={disabled}
					color={this.hexValue}
					colorSelectRef={this.colorSelectRef}
				/>
            </>
			<Panel
				open={open}
				anchorEl={this.colorSelectRef.current as HTMLElement}
				onClose={this.handleClose}
				TransitionProps={{
					onEnter: this.onPanelOpen,
				}}
			>
				{(predefinedColors.length > 0) && <PredefinedColors colors={predefinedColors} onChange={this.setBaseColor} />}
				<Grid
					container
					direction="row"
					alignItems="center"
					justifyContent="space-between"
				>
					<ColorSquareSelector value={baseColor} onChange={this.setSelectedColor} />
					<ColorSlider onChange={this.setBaseColor} />
				</Grid>
				<Grid
					container
					direction="row"
					justifyContent="flex-start"
					alignItems="center"
				>
					<Grid item>
						<ColorSample color={selectedColor} />
					</Grid>
					<Grid item>
						<FormControl className='colorPicker'>
							<SelectedHash
								value={hashInput.replace('#', '')}
								onChange={this.handleHashInputChange}
								withOpacity={opacitySliderVisibility}
								startAdornment={<StyledAdornment position="start" disableTypography>#</StyledAdornment>}
							/>
						</FormControl>
					</Grid>
				</Grid>
				{opacityEnabled &&
					<OpacityControl
						opacity={opacity}
						onOpacityChanged={this.setOpacity}
						sliderVisible={opacitySliderVisibility}
						onSliderVisibilityChanged={this.setOpacityVisibility}
					/>
				}
				{!disableButtons && this.renderFooter()}
			</Panel>
		</>;
	}
}
