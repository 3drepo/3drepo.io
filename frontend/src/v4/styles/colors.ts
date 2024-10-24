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

import { mapValues } from 'lodash';

import { hexToGLColor, hexToOpacity } from '@/v5/helpers/colors.helper';

export const BLACK = '#000000';
export const WHITE = '#ffffff';
export const PRIMARY_MAIN = '#0c2f54';
export const SECONDARY_MAIN = '#06563c';

export const COLOR = {
	PRIMARY_MAIN,
	PRIMARY_LIGHT: '#3c5876',
	PRIMARY_DARK: '#08203a',
	SECONDARY_MAIN: '#06563c',
	SECONDARY_MAIN_54: hexToOpacity(SECONDARY_MAIN, 54),
	SECONDARY_LIGHT: '#377763',
	SECONDARY_DARK: '#043827',
	PRIMARY_MAIN_80: hexToOpacity(PRIMARY_MAIN, 80),
	PRIMARY_MAIN_6: hexToOpacity(PRIMARY_MAIN, 6),

	WHITE,
	WHITE_20: hexToOpacity(WHITE, 20),
	WHITE_10: hexToOpacity(WHITE, 10),
	WHITE_87: hexToOpacity(WHITE, 87),

	TRANSPARENT : hexToOpacity(WHITE, 0),

	BLACK,
	BLACK_6: hexToOpacity(BLACK, 6),
	BLACK_12: hexToOpacity(BLACK, 12),
	BLACK_16: hexToOpacity(BLACK, 16),
	BLACK_20: hexToOpacity(BLACK, 20),
	BLACK_26: hexToOpacity(BLACK, 26),
	BLACK_30: hexToOpacity(BLACK, 30),
	BLACK_40: hexToOpacity(BLACK, 40),
	BLACK_50: hexToOpacity(BLACK, 50),
	BLACK_54: hexToOpacity(BLACK, 54),
	BLACK_60: hexToOpacity(BLACK, 60),
	BLACK_70: hexToOpacity(BLACK, 70),
	BLACK_80: hexToOpacity(BLACK, 80),
	BLACK_87: hexToOpacity(BLACK, 87),

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
