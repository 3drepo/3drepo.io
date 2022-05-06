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
import { StyledItemText, StyledListItem, CopyText } from '@/v4/routes/components/filterPanel/components/filtersMenu/filtersMenu.styles';
import { Wrapper } from '@/v4/routes/components/filterPanel/components/childMenu/childMenu.styles';
import _ from 'lodash';

export const theme = createTheme(
	_.merge(
		_.cloneDeep(oldTheme),
		{
			components: {
				MuiDialog: {
					styleOverrides: {
						paper: {
							maxWidth: 'unset',
						},
					},
				},
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
				MuiPaper: {
					styleOverrides: {
						rounded: {
							borderRadius: 6,
						},
					},
				},
				MuiAvatar: {
					styleOverrides: {
						root: {
							height: '32 !important',
							width: '32 !important',
							border: 'none !important',
							margin: '0 !important',
							alignSelf: 'flex-start',
						},
					},
				},
				MuiTabs: {
					styleOverrides: {
						root: {
							minHeight: 'unset',
							background: COLOR.PRIMARY_MAIN_CONTRAST,
							paddingLeft: 0,
							paddingRight: 0,
							'.MuiTabs-indicator': {
								backgroundColor: COLOR.PRIMARY_MAIN,
							},
							'.MuiTabs-flexContainer': {
								padding: '0 14px',
								width: 'fit-content',
							},
						},
					},
				},
				MuiTab: {
					styleOverrides: {
						root: {
							minWidth: 'unset',
							minHeight: 'unset',
							textTransform: 'unset',
							margin: 0,
							marginRight: 15,
							padding: '15px 0',
							fontWeight: 400,
						},
					},
				},
				MuiList: {
					styleOverrides: {
						root: {
							borderRadius: '6px !important',
							boxShadow: `0px 9px 28px 8px rgb(0 0 0 / 5%),
										0px 6px 16px 0px rgb(0 0 0 / 8%),
										0px 3px 6px -4px rgb(0 0 0 / 12%) !important`,
							padding: '4px 0',
							'.MuiList-root': {
								paddingTop: 0,
								paddingBottom: 0,
								boxShadow: 'none !important',
								minWidth: 180,
								'.MuiTextField-root': {
									width: 122,
								},
								'.MuiInputBase-root.MuiInputBase-adornedEnd': {
									paddingRight: 0,
								},
								'fieldset.MuiOutlinedInput-notchedOutline': {
									borderWidth: 0,
									'&:hover:not(.Mui-error)': {
										borderTop: 0,
										borderLeft: 0,
										borderRight: 0,
										borderRadius: 0,
									},
								},
								'input[type="tel"].MuiOutlinedInput-input': {
									padding: '0 5px 0 9px',
									height: 28,
								},
								'.MuiButtonBase-root.MuiIconButton-edgeEnd': {
									padding: 0,
								},
								[`& ${Wrapper}`]: {
									overflow: 'hidden',
									left: '100%',
									borderRadius: '6px',
								},
							},
							// filter panel menu
							[`& ${StyledListItem}${StyledListItem}`]: {
								minWidth: 121,
								padding: '2px 10px',
								// items
								[`& ${StyledItemText}`]: {
									color: COLOR.SECONDARY_MAIN,
								},
								[`& ${CopyText}`]: {
									fontWeight: 500,
								},
							},
							'& .MuiButtonBase-root': {
								margin: 0,
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
