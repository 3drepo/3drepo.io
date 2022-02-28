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
import React from 'react';
import { createMuiTheme } from '@material-ui/core/styles';
import { TypographyOptions } from '@material-ui/core/styles/createTypography';
import RadioButtonIcon from '@assets/icons/controls/radio_button.svg';
import RadioButtonCheckedIcon from '@assets/icons/controls/radio_button_checked.svg';
import CheckboxIcon from '@assets/icons/controls/checkbox.svg';
import CheckboxCheckedIcon from '@assets/icons/controls/checkbox_checked.svg';
import CheckboxIndeterminatedIcon from '@assets/icons/controls/checkbox_indeterminated.svg';

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

export const theme = createMuiTheme({
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
	props: {
		MuiTextField: {
			variant: 'outlined',
			InputLabelProps: {
				shrink: false,
			},
		},
		MuiInput: {
			disableUnderline: true,
		},
		MuiCheckbox: {
			color: 'primary',
			icon: React.createElement(CheckboxIcon),
			checkedIcon: React.createElement(CheckboxCheckedIcon),
			indeterminateIcon: React.createElement(CheckboxIndeterminatedIcon),
		},
		MuiRadio: {
			color: 'primary',
			icon: React.createElement(RadioButtonIcon),
			checkedIcon: React.createElement(RadioButtonCheckedIcon),
		},
		MuiTooltip: {
			PopperProps: {
				// This is necessary for overriding styles of v4 tooltips
				container: () => document.getElementById('v4Overrides'),
			},
		},
	},
	overrides: {
		MuiBackdrop: {
			root: {
				backgroundColor: 'rgba(18, 30, 51, 0.9)',
				backdropFilter: 'blur(10px)',
			},
		},
		MuiDialog: {
			paper: {
				minWidth: '30%',
				borderRadius: 10,
			},
			paperWidthFalse: {
				maxWidth: 633,
			},
		},
		MuiDialogActions: {
			root: {
				backgroundColor: COLOR.TERTIARY_LIGHTEST,
			},
		},
		MuiDialogTitle: {
			root: {
				paddingTop: 28,
				paddingBottom: 0,
				textAlign: 'center',
				'& .MuiTypography-root': {
					...typography.h1,
				},
			},
		},
		MuiDialogContent: {
			root: {
				paddingTop: 7,
				paddingBottom: 22,
				flex: 0,
			},
		},
		MuiDialogContentText: {
			root: {
				...typography.h4,
				marginBottom: 0,
				color: COLOR.BASE_MAIN,
				textAlign: 'center',
			},
		},
		MuiAppBar: {
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
		MuiAvatar: {
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
		MuiMenuItem: {
			root: {
				margin: '0',
			},
		},
		MuiList: {
			root: {
				borderRadius: 5,
				boxShadow: SHADOW.LEVEL_5,
			},
			padding: {
				paddingTop: 0,
				paddingBottom: 0,
			},
		},
		MuiListItem: {
			root: {
				'&$selected': {
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
		},
		MuiTooltip: {
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
		MuiFab: {
			root: {
				color: COLOR.PRIMARY_MAIN_CONTRAST,
				height: 37,
				width: 37,
				margin: '8px 7px',
				backgroundColor: 'transparent',
				boxShadow: 'none',
				border: `1px solid ${COLOR.PRIMARY_MAIN_CONTRAST}`,
				transition: 'none',
			},
			label: {
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
		MuiBreadcrumbs: {
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
					margin: 0,
					padding: '10px 8px',
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
		MuiOutlinedInput:
			{
				root: {
					background: COLOR.PRIMARY_MAIN_CONTRAST,
					'& $notchedOutline, &$disabled:hover:not($error) $notchedOutline, &$disabled $notchedOutline': {
						borderColor: COLOR.BASE_LIGHTEST,
						borderRadius: 5,
						borderWidth: 1,
					},
					'&:hover:not($error) $notchedOutline, &$focused:not($error) $notchedOutline': {
						borderColor: COLOR.TERTIARY_MAIN,
						borderWidth: 1,
					},
					'& $input': {
						padding: '0px 15px',
						height: 35,
						color: COLOR.BASE_MAIN,
						...typography.body1,
						lineHeight: '35px',
					},
					'&$focused $input': {
						color: COLOR.SECONDARY_MAIN,
					},
					'&$disabled $input': {
						color: COLOR.BASE_LIGHT,
					},
					'&$disabled $path': {
						fill: COLOR.BASE_LIGHT,
					},
					'&$error $input': {
						color: COLOR.ERROR_MAIN,
					},
					'&$error': {
						backgroundColor: COLOR.ERROR_LIGHTEST,
					},
					'&$error $path': {
						fill: COLOR.ERROR_MAIN,
					},
				},
			},
		MuiSelect: {
			root: {
				background: COLOR.PRIMARY_MAIN_CONTRAST,
				margin: '38px 0 0',
				width: '100%',
				height: 35,
				boxSizing: 'border-box',
			},
			select: {
				border: `1px solid ${COLOR.BASE_LIGHTEST}`,
				borderRadius: 5,
				color: COLOR.BASE_MAIN,
				lineHeight: '35px',
				'&:focus': {
					borderRadius: 5,
				},
			},
			icon: {
				marginTop: '38px',
				top: 'inherit',
				right: '5px',
			},
		},
		MuiTextField: {
			root: {
				margin: '38px 0 0',
				width: '100%',
				'& $label': {
					...typography.kicker,
					top: '-38px',
					left: '-13px',
					color: COLOR.BASE_MAIN,
				},
				'& $label:not(.Mui-error).Mui-focused': {
					color: COLOR.TERTIARY_MAIN,
				},
				'& $label.Mui-disabled': {
					color: COLOR.BASE_LIGHT,
				},
			},
		},
		MuiInput: {
			root: {
				width: '100%',
			},
			underline: {
				'&:before': {
					borderBottom: `1px solid ${COLOR.BASE_LIGHTEST}`,
				},
				'&:after': {
					borderBottom: `1px solid ${COLOR.BASE_LIGHTEST}`,
				},
				'&:hover:not($disabled):before': {
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
			},
		},
		MuiInputLabel: {
			root: {
				position: 'absolute',
				...typography.kicker,
				fontSize: '12px',
				color: COLOR.BASE_MAIN,

				'&:not(.Mui-error).Mui-focused': {
					color: COLOR.TERTIARY_MAIN,
				},
			},
			formControl: {
				top: '20px',
				left: '1px',
			},
			asterisk: {
				color: COLOR.ERROR_MAIN,
			},
		},
		MuiFormControl: {
			root: {
				width: '100%',
				boxSizing: 'border-box',
			},
		},
		MuiTouchRipple: {
			root: {
				visibility: 'hidden',
			},
		},
		MuiDivider: {
			root: {
				backgroundColor: COLOR.BASE_LIGHTEST,
			},
		},
		MuiIconButton: {
			root: {
				transition: 'none',
			},
		},
		MuiCheckbox: {
			colorPrimary: {
				color: COLOR.BASE_LIGHTEST,
			},
		},
		MuiButton: {
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
				'&:hover': {
					boxShadow: 'none',
				},
				'&:active': {
					boxShadow: 'none',
				},
				'&$disabled': {
					color: COLOR.PRIMARY_MAIN_CONTRAST,
					backgroundColor: COLOR.BASE_LIGHTEST,
				},
				'&.Mui-focusVisible': {
					boxShadow: SHADOW.LEVEL_5,
				},
			},
			containedPrimary: {
				color: COLOR.PRIMARY_MAIN_CONTRAST,
				'& $path': {
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
				'&$disabled': {
					color: COLOR.BASE_LIGHTEST,
				},
				'&$disabled $path': {
					fill: COLOR.BASE_LIGHTEST,
				},
				'&:hover $path': {
					fill: COLOR.PRIMARY_MAIN_CONTRAST,
				},
				'&:active $path': {
					fill: COLOR.PRIMARY_MAIN_CONTRAST,
				},
				'&.Mui-focusVisible': {
					backgroundColor: COLOR.PRIMARY_MAIN_CONTRAST,
					boxShadow: SHADOW.LEVEL_5,
				},
			},
			outlinedPrimary: {
				'& $path': {
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
				'&$disabled': {
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
				'&:hover': {
					boxShadow: 'none',
					backgroundColor: 'transparent',
					textDecorationLine: 'underline',
				},
				'&:active': {
					boxShadow: 'none',
					backgroundColor: 'transparent',
					textDecorationLine: 'underline',
				},
				'&$disabled': {
					color: COLOR.BASE_LIGHT,
				},
				'&.Mui-focusVisible': {
					backgroundColor: COLOR.PRIMARY_LIGHTEST,
				},
			},
			textPrimary: {
				'&:hover': {
					backgroundColor: 'transparent',
				},
				'&:active': {
					backgroundColor: 'transparent',
				},
			},
		},
		MuiButtonBase: {
			root: {
				margin: '8px',
			},
		},
		MuiRadio: {
			root: {
				// this is for letting the color prop decide the color
				color: null,
			},
		},
	},
});
