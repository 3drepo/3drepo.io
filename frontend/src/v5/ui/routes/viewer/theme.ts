/**
 *  Copyright (C) 2022 3D Repo Ltd
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

import { createTheme } from '@mui/material/styles';
import { COLOR, theme as oldTheme } from '@/v5/ui/themes/theme';
import _ from 'lodash';

export const theme = createTheme(
	_.merge(
		_.cloneDeep(oldTheme),
		{
			components: {
				MuiInput: {
					styleOverrides: {
						formControl: {
							'& svg': {
								top: 13,
							},
						},
					},
				},
				MuiTextField: {
					styleOverrides: {
						root: {
							margin: 0,
						},
					},
				},
				MuiList: {
					styleOverrides: {
						root: {
							boxShadow: 'none',
							borderRadius: 5,
							'& .MuiButtonBase-root': {
								margin: 0,
								color: `${COLOR.SECONDARY_MAIN} !important`,
								'&:hover': {
									backgroundColor: '#f0f5ff', // TODO: fix after new palette is released
								},
							},
						},
					},
				},
			},
		},
	),
);
