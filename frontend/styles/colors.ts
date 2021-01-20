import { mapValues } from 'lodash';

import { hexToGLColor, hexToRgba } from '../helpers/colors';

export const BLACK = '#000000';
export const WHITE = '#ffffff';
export const PRIMARY_MAIN = '#0c2f54';
export const SECONDARY_MAIN = '#06563c';

export const COLOR = {
	PRIMARY_MAIN,
	PRIMARY_LIGHT: '#3c5876',
	PRIMARY_DARK: '#08203a',
	SECONDARY_MAIN: '#06563c',
	SECONDARY_MAIN_54: hexToRgba(SECONDARY_MAIN, .54),
	SECONDARY_LIGHT: '#377763',
	SECONDARY_DARK: '#043827',
	PRIMARY_MAIN_80: hexToRgba(PRIMARY_MAIN, .8),
	PRIMARY_MAIN_6: hexToRgba(PRIMARY_MAIN, .06),

	WHITE,
	WHITE_20: hexToRgba(WHITE, .2),
	WHITE_10: hexToRgba(WHITE, .1),
	WHITE_87: hexToRgba(WHITE, 0.87),

	TRANSPARENT : hexToRgba(WHITE, 0),

	BLACK,
	BLACK_6: hexToRgba(BLACK, .06),
	BLACK_12: hexToRgba(BLACK, .12),
	BLACK_16: hexToRgba(BLACK, .16),
	BLACK_20: hexToRgba(BLACK, .2),
	BLACK_26: hexToRgba(BLACK, .26),
	BLACK_30: hexToRgba(BLACK, .3),
	BLACK_40: hexToRgba(BLACK, .4),
	BLACK_50: hexToRgba(BLACK, .5),
	BLACK_54: hexToRgba(BLACK, .54),
	BLACK_60: hexToRgba(BLACK, .6),
	BLACK_70: hexToRgba(BLACK, .7),
	BLACK_80: hexToRgba(BLACK, .8),
	BLACK_87: hexToRgba(BLACK, .87),

	DARK_GRAY: '#bfbfbf',
	DARK_GRAY_20: 'rgba(158, 158, 158, .2)',
	GRAY: '#f0f0f0',
	GRAY_60: 'rgba(189, 189, 189, .6)',
	GRAY_50: 'rgba(189, 189, 189, .5)',
	LIGHT_GRAY: '#fafafa',
	LIGHT_GRAY_89: 'rgba(250, 250, 250, .89)',
	WARNING_LIGHT: '#ffefef',
	WARNING: '#ffd5d5',
	VIVID_NAVY: '#3452ff',
	SOFT_BLUE: '#4e7496',
	MAROON: '#c9241c',
	CRIMSON: '#dc143c',
	VIVID_RED: '#f00000',
	red: '#e8004e',
	DUSTY_RED: '#d3494e',
	CORAL_RED: '#ff073a',
	SOFT_RED: '#c27676',
	DARK_ORANGE: '#f97807',
	ORANGE: '#fa9034',
	VIVID_ORANGE: '#ff8800',
	BRIGHT_ORANGE: '#fd8d49',
	LIGHT_ORANGE: '#f7bb83',
	SUNGLOW: '#ffca28',
	GREEN: '#008241',
	DARK_GREEN: '#245924',
	MED_SEA_GREEN: '#2e9863',
	SOFT_YELLOW_GREEN: '#96c858',
	LIME_GREEN: '#4eb227',
	LIGHT_GREEN: '#7db780',
	LIGHT_GRAYISH_GREEN: '#7ca687',
	STRONG_GREEN: '#0add08',
	BRIGHT_GREEN: '#3eaf77',
	RED: '#d24b45',
	LEMON_CHIFFON: '#f0d92e',
	YELLOW: '#ffff36',
	LIGHT_YELLOW: '#f6e985',
	LIGHT_GRAYISH_YELLOW: '#e9eba0',
	VIVID_YELLOW: '#fffd01',
	POMEGRANATE: '#F44336',
	NEGATIVE: 'rgba(234, 57, 57, 1)',
	NEGATIVE_87: 'rgba(234, 57, 57, 0.87)',
	REGENT_GRAY: '#8397AC',
	SILVER_CHALICE: '#A8A8A8',
	LIGHT_BLUE: '#6788ab',
	LIGHT_GREY_BLUE: '#dee2e6',
	ALICE_BLUE: '#f0f7ff',
	CLOUD: '#cfcdcc',
	TUNDORA: '#4d4d4d'
};

export const PIN_COLORS = mapValues(COLOR, hexToGLColor);
