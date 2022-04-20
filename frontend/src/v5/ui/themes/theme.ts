/**
 *  Copyright (C) 2021 3D Repo Ltd
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
import { createElement } from 'react';
import { createTheme } from '@mui/material/styles';
import RadioButtonIcon from '@assets/icons/controls/radio_button.svg';
import RadioButtonCheckedIcon from '@assets/icons/controls/radio_button_checked.svg';
import CheckboxIcon from '@assets/icons/controls/checkbox.svg';
import CheckboxCheckedIcon from '@assets/icons/controls/checkbox_checked.svg';
import CheckboxIndeterminatedIcon from '@assets/icons/controls/checkbox_indeterminated.svg';
import { TypographyOptions } from '@mui/material/styles/createTypography';
import ChevronIcon from '@assets/icons/chevron.svg';

export const COLOR = {
	PRIMARY_MAIN_CONTRAST: '#fff',
	PRIMARY_MAIN: '#00C1D4',
	PRIMARY_DARK: '#01ACBD',
	PRIMARY_DARKEST: '#009BAA',
	PRIMARY_MID: '#45CCD9',
	PRIMARY_LIGHT: '#80E0E9',
	PRIMARY_LIGHTEST: '#E6F9FB',
	PRIMARY_ACCENT: '#F6F8FA',
	SECONDARY_MAIN: '#172B4D',
	SECONDARY_DARK: '#121E33',
	SECONDARY_MID: '#2E405F',
	SECONDARY_LIGHT: '#516079',
	SECONDARY_LIGHTEST: '#E8EAED',
	TERTIARY_MAIN: '#023891',
	TERTIARY_DARK: '#032B6C',
	TERTIARY_MID: '#1A59C2',
	TERTIARY_LIGHT: '#4075CC',
	TERTIARY_LIGHTEST: '#F2F6FC',
	BASE_MAIN: '#6B778C',
	BASE_DARK: '#3D3E4A',
	BASE_MID: '#565768',
	BASE_LIGHT: '#BCBECA',
	BASE_LIGHTEST: '#D0D9EB',
	ERROR_MAIN: '#BE4343',
	ERROR_DARK: '#A33232',
	ERROR_DARKEST: '#8E2A2A',
	ERROR_MID: '#C55656',
	ERROR_LIGHT: '#CE7272',
	ERROR_LIGHTEST: '#F9ECEC',
	FAVOURITE_MAIN: '#F5CB34',
	FAVOURITE_DARK: '#D4AE26',
	FAVOURITE_MID: '#F8D867',
	FAVOURITE_LIGHT: '#FAE59A',
	FAVOURITE_LIGHTEST: '#FEFAEB',
};

export const FONT_WEIGHT = {
	REGULAR: 400,
	MEDIUM: 500,
	BOLD: 600,
	BOLDER: 700,
};

export const GRADIENT = {
	MAIN: 'linear-gradient(90deg, #0047BB -5.07%, #00C1D4 105.07%)',
	SECONDARY: 'linear-gradient(89.98deg, #172B4D 0.01%, #2E405F 99.99%)',
};

export const SHADOW = {
	LEVEL_1: '0px 1px 1px rgba(0, 0, 0, 0.14), 0px 2px 1px rgba(0, 0, 0, 0.12), 0px 1px 3px rgba(0, 0, 0, 0.2)',
	LEVEL_2: '0px 2px 2px rgba(0, 0, 0, 0.14), 0px 3px 1px rgba(0, 0, 0, 0.12), 0px 1px 5px rgba(0, 0, 0, 0.2)',
	LEVEL_3: '0px 3px 4px rgba(0, 0, 0, 0.14), 0px 3px 3px rgba(0, 0, 0, 0.12), 0px 1px 8px rgba(0, 0, 0, 0.2)',
	LEVEL_4: '0px 4px 5px rgba(0, 0, 0, 0.14), 0px 1px 10px rgba(0, 0, 0, 0.12), 0px 2px 4px rgba(0, 0, 0, 0.2)',
	LEVEL_5: '0px 6px 10px rgba(0, 0, 0, 0.14), 0px 1px 18px rgba(0, 0, 0, 0.12), 0px 3px 5px rgba(0, 0, 0, 0.2)',
	LEVEL_6: '0px 8px 10px rgba(0, 0, 0, 0.14), 0px 3px 14px rgba(0, 0, 0, 0.12), 0px 5px 5px rgba(0, 0, 0, 0.2)',
	LEVEL_7: '0px 9px 12px rgba(0, 0, 0, 0.14), 0px 3px 16px rgba(0, 0, 0, 0.12), 0px 5px 6px rgba(0, 0, 0, 0.2)',
	LEVEL_8: '0px 12px 17px rgba(0, 0, 0, 0.14), 0px 5px 22px rgba(0, 0, 0, 0.12), 0px 7px 8px rgba(0, 0, 0, 0.2)',
	LEVEL_9: '0px 16px 24px rgba(0, 0, 0, 0.14), 0px 6px 30px rgba(0, 0, 0, 0.12), 0px 8px 10px rgba(0, 0, 0, 0.2)',
	LEVEL_10: '0px 24px 38px rgba(0, 0, 0, 0.14), 0px 9px 46px rgba(0, 0, 0, 0.12), 0px 11px 15px rgba(0, 0, 0, 0.2)',
};

const typography: TypographyOptions = {
	fontFamily: 'Inter, Arial, sans-serif',
	h1: {
		fontWeight: FONT_WEIGHT.MEDIUM,
		fontSize: '1.5rem',
		lineHeight: '1.875rem',
	},
	h2: {
		fontWeight: FONT_WEIGHT.MEDIUM,
		fontSize: '1.125rem',
		lineHeight: '1.5rem',
	},
	h3: {
		fontWeight: FONT_WEIGHT.MEDIUM,
		fontSize: '0.938rem',
		lineHeight: '1.313rem',
	},
	h4: {
		fontWeight: FONT_WEIGHT.REGULAR,
		fontSize: '0.938rem',
		lineHeight: '1.313rem',
	},
	h5: {
		fontWeight: FONT_WEIGHT.MEDIUM,
		fontSize: '0.8125rem',
		lineHeight: '1.188rem',
	},
	body1: {
		fontWeight: FONT_WEIGHT.REGULAR,
		fontSize: '0.75rem',
		lineHeight: '1.125rem',
	},
	body2: {
		fontWeight: FONT_WEIGHT.BOLD,
		fontSize: '0.563rem',
		lineHeight: '0.75rem',
		letterSpacing: '0.18em',
		textTransform: 'uppercase',
	},
	link: {
		fontWeight: FONT_WEIGHT.MEDIUM,
		fontSize: '0.75rem',
		lineHeight: '1.125rem',
		textDecoration: 'underline',
	},
	caption: {
		fontWeight: FONT_WEIGHT.MEDIUM,
		fontSize: '0.625rem',
		lineHeight: '1rem',
	},
	kickerTitle: {
		fontWeight: FONT_WEIGHT.BOLDER,
		fontSize: '0.625rem',
		lineHeight: '1rem',
		letterSpacing: '0.18em',
		textTransform: 'uppercase',
	},
	kicker: {
		fontWeight: FONT_WEIGHT.BOLD,
		fontSize: '0.563rem',
		lineHeight: '0.75rem',
		letterSpacing: '0.18em',
		textTransform: 'uppercase',
	},
};

export const theme = createTheme({
	palette: {
		primary: {
			main: COLOR.PRIMARY_MAIN,
			dark: COLOR.PRIMARY_DARK,
			darkest: COLOR.PRIMARY_DARKEST,
			mid: COLOR.PRIMARY_MID,
			light: COLOR.PRIMARY_LIGHT,
			lightest: COLOR.PRIMARY_LIGHTEST,
			contrastText: COLOR.PRIMARY_LIGHTEST,
			contrast: COLOR.PRIMARY_MAIN_CONTRAST,
			accent: COLOR.PRIMARY_ACCENT,
		},
		secondary: {
			main: COLOR.SECONDARY_MAIN,
			dark: COLOR.SECONDARY_DARK,
			mid: COLOR.SECONDARY_MID,
			light: COLOR.SECONDARY_LIGHT,
			lightest: COLOR.SECONDARY_LIGHTEST,
			contrastText: COLOR.SECONDARY_LIGHTEST,
		},
		tertiary: {
			main: COLOR.TERTIARY_MAIN,
			dark: COLOR.TERTIARY_DARK,
			mid: COLOR.TERTIARY_MID,
			light: COLOR.TERTIARY_LIGHT,
			lightest: COLOR.TERTIARY_LIGHTEST,
			contrastText: COLOR.TERTIARY_LIGHTEST,
		},
		base: {
			main: COLOR.BASE_MAIN,
			dark: COLOR.BASE_DARK,
			mid: COLOR.BASE_MID,
			light: COLOR.BASE_LIGHT,
			lightest: COLOR.BASE_LIGHTEST,
			contrastText: COLOR.BASE_LIGHTEST,
		},
		error: {
			main: COLOR.ERROR_MAIN,
			dark: COLOR.ERROR_DARK,
			darkest: COLOR.ERROR_DARKEST,
			mid: COLOR.ERROR_MID,
			light: COLOR.ERROR_LIGHT,
			lightest: COLOR.ERROR_LIGHTEST,
			contrastText: COLOR.ERROR_LIGHTEST,
		},
		favourite: {
			main: COLOR.FAVOURITE_MAIN,
			dark: COLOR.FAVOURITE_DARK,
			mid: COLOR.FAVOURITE_MID,
			light: COLOR.FAVOURITE_LIGHT,
			lightest: COLOR.FAVOURITE_LIGHTEST,
			contrastText: COLOR.FAVOURITE_LIGHTEST,
		},
		gradient: {
			main: GRADIENT.MAIN,
			secondary: GRADIENT.SECONDARY,
		},
		shadows: {
			level_1: SHADOW.LEVEL_1,
			level_2: SHADOW.LEVEL_2,
			level_3: SHADOW.LEVEL_3,
			level_4: SHADOW.LEVEL_4,
			level_5: SHADOW.LEVEL_5,
			level_6: SHADOW.LEVEL_6,
			level_7: SHADOW.LEVEL_7,
			level_8: SHADOW.LEVEL_8,
			level_9: SHADOW.LEVEL_9,
			level_10: SHADOW.LEVEL_10,
		},
	},
	typography,
	components: {
		MuiTextField: {
			defaultProps: {
				variant: 'outlined',
				InputLabelProps: {
					shrink: false,
				},
			},
			styleOverrides: {
				root: {
					margin: '38px 0 0',
					width: '100%',
					'& label': {
						...typography.body1,
						top: '-35.5px',
						left: '-13px',
						color: COLOR.BASE_MAIN,

						'&.Mui-disabled': {
							color: COLOR.BASE_LIGHT,
						},

						'&:not(.Mui-error).Mui-focused': {
							color: COLOR.TERTIARY_MAIN,
						},
					},
					'.Mui-error': {
						'.MuiOutlinedInput-notchedOutline': {
							borderWidth: 1,
						},
					},
				},
			},
		},
		MuiInput: {
			defaultProps: {
				disableUnderline: true,
			},
			styleOverrides: {
				root: {
					width: '100%',
				},
				underline: {
					[`&:before,
					  &:after,
					  &:hover:not(.Mui-disabled):before`]: {
						borderBottom: `1px solid ${COLOR.BASE_LIGHTEST}`,
					},
				},
				input: {
					padding: '0px 14px',
				},
				formControl: {
					'label + &': {
						marginTop: 0,
					},
					'& .MuiSelect-selectMenu': {
						height: 35,
					},
					'& svg': {
						right: 14,
						marginTop: 40,
						position: 'absolute',
						pointerEvents: 'none',
						'& path': {
							fill: COLOR.BASE_MAIN,
						},
					},
				},
			},
		},
		MuiCheckbox: {
			defaultProps: {
				color: 'primary',
				icon: createElement(CheckboxIcon),
				checkedIcon: createElement(CheckboxCheckedIcon),
				indeterminateIcon: createElement(CheckboxIndeterminatedIcon),
			},
			styleOverrides: {
				colorPrimary: {
					color: COLOR.BASE_LIGHTEST,
				},
			},
		},
		MuiRadio: {
			defaultProps: {
				color: 'primary',
				icon: createElement(RadioButtonIcon),
				checkedIcon: createElement(RadioButtonCheckedIcon),
			},
			styleOverrides: {
				root: {
					// this is for letting the color prop decide the color
					color: null,
				},
				colorPrimary: {
					color: COLOR.PRIMARY_MAIN,
				},
			},
		},
		MuiTooltip: {
			defaultProps: {
				PopperProps: {
					// This is necessary for overriding styles of v4 tooltips
					container: () => document.getElementById('v4Overrides'),
				},
			},
			styleOverrides: {
				tooltip: {
					backgroundColor: COLOR.SECONDARY_DARK,
					padding: '7px 10px 8px 10px',
					borderRadius: '3px',
					...typography.caption,
				},
				tooltipPlacementBottom: {
					margin: '5px 0 !important',
				},
			},
		},
		MuiBackdrop: {
			styleOverrides: {
				root: {
					backgroundColor: 'transparent',
				},
			},
		},
		MuiPaper: {
			defaultProps: {
				elevation: 8,
			},
		},
		MuiDialog: {
			styleOverrides: {
				paper: {
					minWidth: '30%',
					borderRadius: 10,
				},
				paperWidthFalse: {
					maxWidth: 633,
				},
				container: {
					backgroundColor: 'rgba(18, 30, 51, 0.9)',
					backdropFilter: 'blur(10px)',
				},
			},
		},
		MuiDialogActions: {
			styleOverrides: {
				root: {
					backgroundColor: COLOR.TERTIARY_LIGHTEST,
				},
			},
		},
		MuiDialogTitle: {
			styleOverrides: {
				root: {
					paddingTop: 28,
					paddingBottom: 0,
					textAlign: 'center',
					'& .MuiTypography-root': {
						...typography.h1,
					},
				},
			},
		},
		MuiDialogContent: {
			styleOverrides: {
				root: {
					paddingTop: 7,
					paddingBottom: 22,
					flex: 0,
				},
			},
		},
		MuiDialogContentText: {
			styleOverrides: {
				root: {
					...typography.h4,
					marginBottom: 0,
					color: COLOR.BASE_MAIN,
					textAlign: 'center',
				},
			},
		},
		MuiAppBar: {
			styleOverrides: {
				root: {
					boxShadow: 'none',
					paddingLeft: 20,
					paddingRight: 20,
					minHeight: 65,
					display: 'flex',
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'space-between',
					background: GRADIENT.SECONDARY,
				},
			},
		},
		MuiAvatar: {
			styleOverrides: {
				root: {
					margin: '8px 7px',
					color: COLOR.PRIMARY_MAIN_CONTRAST,
					backgroundColor: COLOR.TERTIARY_MAIN,
					...typography.body1,
				},
				colorDefault: {
					color: null,
					backgroundColor: null,
				},
			},
		},
		MuiMenuItem: {
			styleOverrides: {
				root: {
					margin: '0',
					padding: '8px 14px',
					width: '100%',

					'&.Mui-selected, &.Mui-selected:hover': {
						backgroundColor: COLOR.TERTIARY_LIGHTEST,
					},
				},
			},
		},
		MuiList: {
			styleOverrides: {
				root: {
					borderRadius: 5,
					boxShadow: SHADOW.LEVEL_5,
				},
				padding: {
					paddingTop: 8,
					paddingBottom: 8,
				},
			},
		},
		MuiListItem: {
			styleOverrides: {
				root: {
					selected: {
						backgroundColor: COLOR.TERTIARY_LIGHTEST,
						'&:hover': {
							backgroundColor: COLOR.TERTIARY_LIGHTEST,
						},
					},
				},
				button: {
					'&:hover': {
						backgroundColor: COLOR.TERTIARY_LIGHTEST,
					},
				},
				padding: {
					paddingTop: 8,
					paddingBottom: 8,
				},
			},
		},
		MuiFab: {
			styleOverrides: {
				root: {
					color: COLOR.PRIMARY_MAIN_CONTRAST,
					height: 37,
					width: 37,
					margin: '8px 7px',
					backgroundColor: 'transparent',
					boxShadow: 'none',
					border: `1px solid ${COLOR.PRIMARY_MAIN_CONTRAST}`,
					transition: 'none',
					'& > *:first-child': {
						height: 17,
						width: 'auto',
					},
				},
				extended: {
					height: null,
					width: null,
					padding: null,
					minWidth: null,
					minHeight: null,
					borderRadius: null,
				},
			},
		},
		MuiBreadcrumbs: {
			styleOverrides: {
				root: {
					maxWidth: '100%',
				},
				ol: {
					flexWrap: 'nowrap',
				},
				li: {
					'&:last-child': {
						overflow: 'hidden',
					},
					'& > a': {
						color: COLOR.PRIMARY_MAIN_CONTRAST,
						...typography.h3,
					},
					'& > button > span > span': {
						marginLeft: '1px',
					},
					'& .MuiButton-endIcon': {
						marginLeft: 6,
					},
				},
				separator: {
					marginLeft: 0,
					marginRight: 0,
					color: COLOR.PRIMARY_MAIN_CONTRAST,
					fontSize: 16,
				},
			},
		},
		MuiOutlinedInput: {
			styleOverrides: {
				root: {
					padidng: 0,
					background: COLOR.PRIMARY_MAIN_CONTRAST,
					'& input': {
						padding: '0px 15px',
						height: 35,
						color: COLOR.BASE_MAIN,
						...typography.body1,
						lineHeight: '35px',
					},
					notchedOutline: {
						borderWidth: 10,
					},
					[`& .MuiOutlinedInput-notchedOutline,
					  &.Mui-disabled .MuiOutlinedInput-notchedOutline,
					  &.Mui-disabled:hover:not(.Mui-error) .MuiOutlinedInput-notchedOutline`]: {
						borderColor: COLOR.BASE_LIGHTEST,
						borderRadius: 5,
						borderWidth: 1,
					},
					[`&:hover:not(.Mui-error) .MuiOutlinedInput-notchedOutline, 
					  &.Mui-focused:not(.Mui-error) .MuiOutlinedInput-notchedOutline`]: {
						borderColor: COLOR.TERTIARY_MAIN,
						borderWidth: 1,
					},
					'&.Mui-focused input': {
						color: COLOR.SECONDARY_MAIN,
					},
					'&.Mui-disabled': {
						'& input': {
							color: COLOR.BASE_LIGHT,
						},
						'& path': {
							fill: COLOR.BASE_LIGHT,
						},
					},
					'&.Mui-error': {
						backgroundColor: COLOR.ERROR_LIGHTEST,
						'& input': {
							color: COLOR.ERROR_MAIN,
						},
						'& path': {
							fill: COLOR.ERROR_MAIN,
						},
					},
				},
			},
		},
		MuiSelect: {
			defaultProps: {
				IconComponent: ChevronIcon,
				variant: 'outlined',
			},
			styleOverrides: {
				select: {
					border: `1px solid ${COLOR.BASE_LIGHTEST}`,
					borderRadius: 5,
					color: COLOR.BASE_MAIN,
					background: COLOR.PRIMARY_MAIN_CONTRAST,
					lineHeight: '35px',
					height: 35,
					paddingTop: 0,
					paddingBottom: 0,
					marginTop: 38,
					width: '100%',
					boxSizing: 'border-box',
					pointerEvents: 'auto',
					'& fieldset, &:focus fieldset, &:active fieldset': {
						border: 0,
					},
					'& ~ svg': {
						position: 'absolute',
						right: 14,
						marginTop: 40,
						pointerEvents: 'none',
						'& path': {
							fill: COLOR.BASE_MAIN,
						},
					},
				},
			},
		},
		MuiInputLabel: {
			styleOverrides: {
				root: {
					position: 'absolute',
					...typography.body1,
					fontSize: '12px',
					color: COLOR.BASE_MAIN,

					'&:not(.Mui-error).Mui-focused': {
						color: COLOR.TERTIARY_MAIN,
					},
				},
				formControl: {
					top: '18px',
					left: '1px',
				},
				asterisk: {
					color: COLOR.ERROR_MAIN,
				},
			},
		},
		MuiFormControl: {
			styleOverrides: {
				root: {
					width: '100%',
					boxSizing: 'border-box',
				},
			},
		},
		MuiTouchRipple: {
			styleOverrides: {
				root: {
					visibility: 'hidden',
				},
			},
		},
		MuiDivider: {
			styleOverrides: {
				root: {
					borderColor: COLOR.BASE_LIGHTEST,
				},
			},
		},
		MuiIconButton: {
			styleOverrides: {
				root: {
					transition: 'none',
					padding: 12,
				},
			},
		},
		MuiButton: {
			styleOverrides: {
				iconSizeMedium: {
					'& > *:first-child': {
						fontSize: 13,
					},
				},
				iconSizeSmall: {
					'& > *:first-child': {
						fontSize: 13,
					},
				},
				root: {
					borderRadius: 5,
					disableRipple: true,
					textTransform: 'initial',
					padding: '10px 15px',
					fontSize: '0.75rem',
					fontWeight: FONT_WEIGHT.BOLD,
					minWidth: null,
					transition: 'none',
				},
				contained: {
					padding: '10px 15px',
					height: '35px',
					boxShadow: 'none',
					[`&:hover,
					  &:active`]: {
						boxShadow: 'none',
					},
					'&.Mui-disabled': {
						color: COLOR.PRIMARY_MAIN_CONTRAST,
						backgroundColor: COLOR.BASE_LIGHTEST,
					},
					'.Mui-focusVisible': {
						boxShadow: SHADOW.LEVEL_5,
					},
				},
				containedPrimary: {
					color: COLOR.PRIMARY_MAIN_CONTRAST,
					'& path': {
						fill: COLOR.PRIMARY_MAIN_CONTRAST,
					},
					'&:hover': {
						backgroundColor: COLOR.PRIMARY_DARK,
					},
					'&:active': {
						backgroundColor: COLOR.PRIMARY_DARKEST,
					},
				},
				containedSecondary: {
					color: COLOR.SECONDARY_MAIN,
					backgroundColor: COLOR.TERTIARY_LIGHTEST,
					'&:hover': {
						color: COLOR.PRIMARY_MAIN_CONTRAST,
						backgroundColor: COLOR.SECONDARY_MAIN,
					},
					'&:active': {
						color: COLOR.PRIMARY_MAIN_CONTRAST,
						backgroundColor: COLOR.SECONDARY_DARK,
					},
				},
				containedSizeSmall: {
					height: '30px',
					padding: '7.5px 15px',
					fontSize: null, // null value means it will use the size from button.root
				},
				outlined: {
					height: '35px',
					padding: '10px 15px',
					backgroundColor: 'transparent',
					'.Mui-focusVisible': {
						backgroundColor: COLOR.PRIMARY_MAIN_CONTRAST,
						boxShadow: SHADOW.LEVEL_5,
					},
					'&.Mui-disabled': {
						color: COLOR.BASE_LIGHTEST,
						'& path': {
							fill: COLOR.BASE_LIGHTEST,
						},
					},
					[`&:hover path,
					  &:active path`]: {
						fill: COLOR.PRIMARY_MAIN_CONTRAST,
					},
				},
				outlinedPrimary: {
					'& path': {
						fill: COLOR.PRIMARY_MAIN,
					},
					'&:hover': {
						backgroundColor: COLOR.PRIMARY_MAIN,
						color: COLOR.PRIMARY_MAIN_CONTRAST,
					},
					'&:active': {
						backgroundColor: COLOR.PRIMARY_DARK,
					},
				},
				outlinedSecondary: {
					color: COLOR.SECONDARY_MAIN,
					backgroundColor: 'transparent',
					'&.Mui-disabled': {
						borderColor: COLOR.BASE_LIGHTEST,
					},
					'&:hover': {
						color: COLOR.PRIMARY_MAIN_CONTRAST,
						backgroundColor: COLOR.SECONDARY_MAIN,
					},
					'&:active': {
						color: COLOR.PRIMARY_MAIN_CONTRAST,
						backgroundColor: COLOR.SECONDARY_DARK,
					},
				},
				outlinedSizeSmall: {
					height: '30px',
					padding: '7.5px 15px',
					fontSize: null, // null value means it will use the size from button.root
				},
				text: {
					padding: '10px 15px',
					[`&:hover,
					  &:active`]: {
						boxShadow: 'none',
						backgroundColor: 'transparent',
						textDecorationLine: 'underline',
					},
					'&.Mui-disabled': {
						color: COLOR.BASE_LIGHT,
					},
					'.Mui-focusVisible': {
						backgroundColor: COLOR.PRIMARY_LIGHTEST,
					},
				},
				textPrimary: {
					[`&:hover,
					  &:active`]: {
						backgroundColor: 'transparent',
					},
				},
			},
		},
		MuiButtonBase: {
			defaultProps: {
				disableRipple: true,
			},
			styleOverrides: {
				root: {
					margin: '8px',
				},
			},
		},
	},
});
