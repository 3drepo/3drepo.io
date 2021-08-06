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

import { createMuiTheme } from '@material-ui/core/styles';

export const COLOR = {
	WHITE: '#fff',
	PRIMARY_MAIN: '#00C1D4',
	PRIMARY_DARK: '#01ACBD',
	PRIMARY_DARKEST: '#009BAA',
	PRIMARY_MID: '#45CCD9',
	PRIMARY_LIGHT: '#80E0E9',
	PRIMARY_LIGHTEST: '#E6F9FB',
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
};

export const SHADOW = {
	SMALL: '0px 1px 1px rgba(9, 30, 66, 0.25), 0px 0px 1px rgba(9, 30, 66, 0.31)',
	MEDIUM: '0px 3px 5px rgba(9, 30, 66, 0.2), 0px 0px 1px rgba(9, 30, 66, 0.31)',
	LARGE: '0px 0px 12px 6px rgba(9, 30, 66, 0.2), 0px 0px 1px rgba(9, 30, 66, 0.31)',
	XLARGE: '0px 18px 28px rgba(9, 30, 66, 0.15), 0px 0px 1px rgba(9, 30, 66, 0.31)',
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
		},
		shadow: {
			small: SHADOW.SMALL,
			medium: SHADOW.MEDIUM,
			large: SHADOW.LARGE,
			xlarge: SHADOW.XLARGE,
		},
	},
	typography: {
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
			fontSize: '0.813rem',
			lineHeight: '1.188rem',
		},
		body1: {
			fontWeight: FONT_WEIGHT.REGULAR,
			fontSize: '0.75rem',
			lineHeight: '1.125rem',
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
	},
	overrides: {
		MuiTouchRipple: {
			root: {
				visibility: 'hidden',
			},
		},
		MuiButton: {
			root: {
				disableRipple: true,
				textTransform: 'initial',
				padding: '10px 15px',
				fontSize: '0.75rem',
				fontWeight: FONT_WEIGHT.BOLD,
			},
			text: {
				padding: '10px 15px',
			},
			containedSecondary: {
				color: COLOR.SECONDARY_MAIN,
				backgroundColor: COLOR.TERTIARY_LIGHTEST,
				'&:hover': {
					color: COLOR.WHITE,
					backgroundColor: COLOR.SECONDARY_MAIN,
				},
				'&.Mui-focusVisible': {
					color: COLOR.WHITE,
					backgroundColor: COLOR.SECONDARY_DARK,
					boxShadow: 'none',
				},
			},
			contained: {
				boxShadow: 'none',
				'&$disabled': {
					color: COLOR.WHITE,
					backgroundColor: COLOR.BASE_LIGHTEST,
				},
			},
		},
		MuiButtonBase: {
			root: {
				margin: '8px',
			},
		},
	},
});
