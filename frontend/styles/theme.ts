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

import { createMuiTheme } from '@material-ui/core/styles';
import { COLOR } from './colors';

export const theme = createMuiTheme({
	palette: {
		primary: {
			main: '#0C2F54',
			light: '#3c5876',
			dark: '#08203a',
			contrastText: COLOR.WHITE
		},
		secondary: {
			main: '#06563c',
			light: '#377763',
			dark: '#377763',
			contrastText: COLOR.WHITE
		}
	},
	overrides: {
		MuiInput: {
			root: {
				fontSize: '14px'
			},
			underline: {
				'&:before': {
					borderBottomColor: 'rgba(0, 0, 0, .12) !important'
				}
			}
		},
		MuiFormControlLabel: {
			label: {
				fontSize: '14px',
				color: COLOR.BLACK_60
			}
		},
		MuiDialogTitle: {
			root: {
				background: '#08203a',
				padding: '15px 24px 15px',
				color: COLOR.WHITE,
				fontSize: '20px'
			}
		},
		MuiDialogContent: {
			root: {
				padding: '24px'
			}
		},
		MuiDialog: {
			paper: {
				background: '#fafafa'
			}
		},
		MuiSelect: {
			root: {
				fontSize: '14px',
				color: COLOR.BLACK_60
			}
		},
		MuiTab: {
			root: {
				minWidth: '0 !important'
			}
		}
	}
});
