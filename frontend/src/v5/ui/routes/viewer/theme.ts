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
import { Item } from '@/v4/routes/components/customTable/components/cellSelect/cellSelect.styles';
import { Wrapper } from '@/v4/routes/components/filterPanel/components/childMenu/childMenu.styles';
import _ from 'lodash';

export const theme = createTheme(
	_.merge(
		_.cloneDeep(oldTheme),
		{
			components: {
				MuiOutlinedInput: {
					styleOverrides: {
						root: {
							'& input': {
								padding: '0px 8px',
							},
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
				MuiInputLabel: {
					styleOverrides: {
						root: {
							fontSize: '13px',
						},
					},
				},
				MuiInputBase: {
					styleOverrides: {
						root: {
							'& svg': {
								color: COLOR.SECONDARY_MAIN,
								'& path': {
									fill: 'currentColor !important',
								},
							},
						},
						formControl: {
							'&&& .MuiInputBase-input::placeholder': {
								opacity: '1 !important',
								color: '#C1C8D5', // TODO: fix after new palette is released
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
				MuiSelect: {
					components: {
					},
					styleOverrides: {
						select: {
							lineHeight: '22px',
							height: '24px',
							padding: '0 10px',
							marginTop: '18px',
							left: '-14px',
							color: `${COLOR.SECONDARY_MAIN} !important`,

							'& ~ svg': {
								right: 10,
							},
						},
					},
				},
				MuiMenuItem: {
					styleOverrides: {
						root: {
							'&&': {
								padding: '4px 10px',
								fontSize: '12px',
							},
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
							'.MuiTabs-indicator': {
								backgroundColor: COLOR.PRIMARY_MAIN,
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
							paddingTop: 0,
							fontWeight: 400,
							color: COLOR.SECONDARY_MAIN,
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
							// dropdown menu items
							[`& ${Item}${Item}`]: {
								height: 40,
								color: COLOR.SECONDARY_MAIN,
								fontSize: '0.75rem',
							},
						},
					},
				},
				MuiDialog: {
					styleOverrides: {
						container: {
							'.MuiPaper-root .MuiDialogActions-root .MuiButton-root': {
								backgroundColor: COLOR.PRIMARY_MAIN,
								color: COLOR.PRIMARY_MAIN_CONTRAST,
								textDecoration: 'none',
								':hover': {
									backgroundColor: COLOR.PRIMARY_DARK,
								},
								':first-child': {
									':hover': {
										backgroundColor: COLOR.SECONDARY_MAIN,
										color: COLOR.PRIMARY_MAIN_CONTRAST,
									},
									backgroundColor: 'transparent',
									color: COLOR.SECONDARY_MAIN,
									border: `1px solid ${COLOR.SECONDARY_MAIN}`,
								},
							},
						},
					},
				},
				MuiDialogContent: {
					styleOverrides: {
						root: {
							'.PrivatePickersToolbar-dateTitleContainer button': {
								margin: 0,
							},
						},
					},
				},
			},
		},
	),
);
