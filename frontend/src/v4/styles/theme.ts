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

import { createTheme } from '@mui/material/styles';
import { COLOR, WHITE, PRIMARY_MAIN } from './colors';
import { FONT_WEIGHT } from './fonts';
import { media } from './media';
import * as mixins from './mixins';

export const theme = {
	colors: COLOR,
	fontWeights: FONT_WEIGHT,
	mixins,
	media,
} as any;

export const MuiTheme = createTheme({
	palette: {
		primary: {
			main: theme.colors.PRIMARY_MAIN,
			light: theme.colors.PRIMARY_LIGHT,
			dark: theme.colors.PRIMARY_DARK,
			contrastText: theme.colors.WHITE
		},
		secondary: {
			main: theme.colors.SECONDARY_MAIN,
			light: theme.colors.SECONDARY_LIGHT,
			dark: theme.colors.SECONDARY_DARK,
			contrastText: theme.colors.WHITE
		}
	},
	components: {
		MuiCheckbox: {
			defaultProps: {
				color: 'secondary',
			}
		},
		MuiButton: {
			styleOverrides: {
				root: {
					padding: '8px 16px',
					lineHeight: '1.4em',
					letterSpacing: 'normal',
				}
			}
		},
		MuiInput: {
			styleOverrides: {
				root: {
					'fontSize': '14px',
					'&.Mui-disabled': {
						color: 'gainsboro'
					},
				},
				underline: {
					'&:before': {
						borderBottomColor: 'rgba(0, 0, 0, .12) !important'
					}
				},
			}
		},
		MuiInputBase: {
			styleOverrides: {
				root: {
					'overflow': 'hidden',
					'&.Mui-disabled': {
						color: theme.colors.BLACK_60
					}
				},
				input: {
					letterSpacing: 'normal',
				}
			}
		},
		MuiIconButton: {
			styleOverrides: {
				root: {
					padding: 12,
				},
			},
		},
		MuiFormControlLabel: {
			styleOverrides: {
				label: {
					fontSize: '14px',
					color: theme.colors.BLACK_60,
				}
			}
		},
		MuiInputLabel: {
			styleOverrides: {
				shrink: {
					transform: 'translate(0, -.5px) scale(0.75) !important',
					transformOrigin: 'top left',
				}
			},
		},
		MuiFormLabel: {
			styleOverrides: {
				root: {
					'fontSize': '14px',
					'color': theme.colors.BLACK_60,
					'&.Mui-disabled': {
						color: theme.colors.BLACK_60
					}
				}
			}
		},
		MuiDialogTitle: {
			styleOverrides: {
				root: {
					background: theme.colors.PRIMARY_MAIN,
					padding: '0 24px 0',
					color: theme.colors.WHITE,
					fontSize: '20px',
					height: '40px',
					display: 'flex',
					alignItems: 'center',
					'& + .MuiDialogContent-root': {
						paddingTop: 24,
					}
				}
			}
		},
		MuiDialogContent: {
			styleOverrides: {
				root: {
					padding: '24px',
					minWidth: '250px',
					maxHeight: '60vh',
					'.PrivatePickersToolbar-root': {
						color: WHITE,
						backgroundColor: PRIMARY_MAIN,
						'.MuiTypography-root': {
							color: WHITE,
						}
					}
				}
			}
		},
		MuiDialog: {
			styleOverrides: {
				paper: {
					background: theme.colors.LIGHT_GRAY
				},
				paperFullScreen: {
					maxWidth: 'calc(100% - 96px)',
					maxHeight: 'calc(100% - 96px)',
					borderRadius: '4px'
				}
			}
		},
		MuiTextField: {
			defaultProps: {
				variant: 'outlined',
			},
		},
		MuiSelect: {
			defaultProps: {
				variant: 'outlined',
			},
			styleOverrides: {
				select: {
					fontSize: '14px',
					color: theme.colors.BLACK_60
				}
			}
		},
		MuiTab: {
			styleOverrides: {
				root: {
					minWidth: '0 !important',
					letterSpacing: 'normal',
					'@media (min-width: 960px)': {
						fontSize: '13px',
					}
				}
			}
		},
		MuiMenuItem: {
			styleOverrides: {
				root: {
					fontSize: '14px',
					color: theme.colors.BLACK_60,
					paddingTop: '12px',
					paddingBottom: '12px',
					width: '100%',

					'&&.Mui-selected': {
						background: 'rgba(0, 0, 0, 0.08)',
					},
				}
			}
		},
		MuiSnackbarContent: {
			styleOverrides: {
				root: {
					backgroundColor: theme.colors.PRIMARY_MAIN,
					color: theme.colors.WHITE_87
				},
				action: {
					marginRight: '-16px'
				}
			}
		},
		MuiDialogActions: {
			styleOverrides: {
				root: {
					margin: '0 24px 15px 24px'
				}
			}
		},
		MuiChip: {
			styleOverrides: {
				root: {
					marginRight: '10px',
					marginBottom: '10px'
				}
			}
		},
		MuiTypography: {
			styleOverrides: {
				h6: {
					fontSize: 20,
					fontWeight: 400
				},
				h2: {
					letterSpacing: 0,
				}
			}
		},
		MuiToolbar: {
			styleOverrides: {
				root: {
					backgroundColor: theme.colors.PRIMARY_MAIN,
					color: theme.colors.WHITE_87,
					padding: '0 16px !important'
				},
				regular: {
					height: 40,
					minHeight: 40,
					'@media (min-width: 600px)': {
						minHeight: 0
					}
				}
			}
		},
		MuiDrawer: {
			styleOverrides: {
				paper: {
					backgroundColor: theme.colors.WHITE,
					boxShadow: '0px 0px 15px 0px rgba(0,0,0,0.2)',
					zIndex: 10
				},
				paperAnchorDockedRight: {
					borderLeft: 'none'
				}
			}
		},
		MuiListItem: {
			styleOverrides: {
				root: {
					paddingTop: '12px',
					paddingBottom: '12px',
				},
				gutters: {
					'@media (min-width: 600px)': {
						paddingLeft: '24px',
						paddingRight: '24px',
					}
				}
			}
		},
		MuiListItemIcon: {
			styleOverrides: {
				root: {
					minWidth: 'auto',
				},
			}
		},
		MuiListItemAvatar: {
			styleOverrides: {
				root: {
					minWidth: 'auto',
				},
			}
		},
		MuiListItemText: {
			styleOverrides: {
				root: {
					minWidth: 10,
					padding: '0 16px',
					'&:first-child': {
						paddingLeft: 0,
					},
				},
				primary: {
					overflow: 'hidden',
					textOverflow: 'ellipsis',
					whiteSpace: 'nowrap',
					letterSpacing: 'normal',
				},
				secondary: {
					overflow: 'hidden',
					textOverflow: 'ellipsis',
					whiteSpace: 'nowrap',
					letterSpacing: 'normal',
				}
			}
		},
		MuiBadge: {
			styleOverrides: {
				badge: {
					width: 20,
					height: 20,
					top: 0,
					right: 0,
					pointerEvents: 'none'
				},
				colorPrimary: {
					backgroundColor: theme.colors.VIVID_RED,
				},
				colorSecondary: { // Secondary color is used to make the badge disappear
					backgroundColor: 'transparent',
					color: 'transparent'
				}
			}
		},
		MuiIcon: {
			styleOverrides: {
				fontSizeLarge: {
					fontSize: 35
				}
			}
		},
		MuiTooltip: {
			styleOverrides: {
				popper: {
					pointerEvents: 'none'
				}
			}
		},
		MuiAccordion: {
			styleOverrides: {
				root: {
					'&.Mui-expanded': {
						margin: 0,
					},
				}
			}
		},
		MuiTableRow: {
			styleOverrides: {
				root: {
					height: '48px',
				}
			}
		},
	}
});
