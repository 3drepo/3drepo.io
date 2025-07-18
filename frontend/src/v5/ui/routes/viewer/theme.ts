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
import ThinChevronIcon from '@assets/icons/outlined/thin_chevron-outlined.svg';
import { createElement } from 'react';
import { DefaultTheme } from 'styled-components';

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
								height: 34,
								lineHeight: 34,
							},
						},
						notchedOutline: {
							height: '100%',
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
							fontSize: 10,
							textTransform: 'lowercase',
							':first-letter': {
								textTransform: 'uppercase',
							},
							'&.Mui-focused:not(.Mui-error)': {
								color: COLOR.BASE_MAIN,
							},
						},
					},
				},
				MuiInputBase: {
					styleOverrides: {
						root: {
							'&.Mui-focused': {
								'&.Mui-error .MuiSelect-select': {
									boxShadow: `0 0 2px ${COLOR.ERROR_MAIN}`,
								},
								fieldset: {
									borderWidth: '1px !important',
								},
							},
							'& input:not(.MuiAutocomplete-input)': {
								padding: '0px 12px',
							},
						},
						formControl: {
							'&&& .MuiInputBase-input::placeholder': {
								opacity: '1 !important',
								color: COLOR.BASE_LIGHTER,
							},
						},
					},
				},
				MuiAutocomplete: {
					styleOverrides: {
						root: {
							'.MuiOutlinedInput-root .MuiAutocomplete-input': {
								padding: 0,
							},
						},
						endAdornment: {
							marginRight: 5,

							'& > button:last-child svg': {
								width: 10,
								pointerEvents: 'none',
								color: COLOR.BASE_MAIN,
							},
						},
						inputRoot: {
							height: 26,
						},
					},
				},
				MuiFormControl: {
					styleOverrides: {
						root: {
							margin: 0,
						},
					},
				},
				MuiTextField: {
					styleOverrides: {
						root: {
							margin: 0,
							label: {
								fontSize: 10,
							},
							'& .MuiInputBase-root input': {
								height: 26,
							},
						},
					},
				},
				MuiSelect: {
					styleOverrides: {
						select: {
							lineHeight: '26px',
							height: 26,
							padding: '0 10px',
							marginTop: 0,
							color: COLOR.SECONDARY_MAIN,

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
								fontSize: '12px',
							},
						},
					},
				},
				MuiPaper: {
					styleOverrides: {
						root: {
							'.react-autosuggest__suggestions-list': {
								margin: 0,
								'.react-autosuggest__suggestion': {
									height: '34px',
								},
							},
							'&.react-autosuggest__suggestions-container': {
								boxShadow: 'none',
							},
						},
					},
				},
				MuiPopover: {
					defaultProps: {
						container: () => document.getElementById('v4DialogsOverrides'),
					},
					styleOverrides: {
						paper: {
							borderRadius: 8,
							'>ul': {
								borderRadius: 'inherit',
							},
						},
					},
				},
				MuiAvatar: {
					styleOverrides: {
						root: {
							border: 'none',
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
							fontWeight: 500,
							color: COLOR.SECONDARY_MAIN,
						},
					},
				},
				MuiChip: {
					styleOverrides: {
						root: {
							backgroundColor: COLOR.TERTIARY_LIGHTEST,
							color: COLOR.SECONDARY_MAIN,
							borderRadius: 5,
							fontWeight: 600,
							margin: '3px 4px 3px 0',
						},
						deleteIcon: {
							color: 'inherit',
							height: 15,
							width: 15,
						},
					},
				},
				MuiList: {
					styleOverrides: {
						root: {
							boxShadow: `0px 9px 28px 8px rgb(0 0 0 / 5%),
										0px 6px 16px 0px rgb(0 0 0 / 8%),
										0px 3px 6px -4px rgb(0 0 0 / 12%) !important`,
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
									borderRadius: 10,
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
							// multiSelect
							'&[aria-labelledby="multiselect-label"]': {
								'.MuiMenuItem-root': {
									padding: 0,
									minHeight: 34,
								},
							},
						},
					},
				},
				MuiListItemButton: {
					styleOverrides: {
						root: {
							'>*': {
								color: `${COLOR.BASE_MAIN} !important`,
							},
						},
					},
				},
				MuiTooltip: {
					defaultProps: {
						disableInteractive: true,
					},
				},
				MuiDialog: {
					defaultProps: {
						container: () => document.getElementById('v4DialogsOverrides'),
					},
					styleOverrides: {
						paper: {
							maxWidth: 'unset !important',
							minWidth: 'unset !important',
						},
						root: {
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
				MuiAccordionSummary: {
					defaultProps: {
						// this messes up with existing accordion (WHY is that an accordion!???)
						// in the viewer (issues/risks card)
						expandIcon: createElement(ThinChevronIcon),
					},
				},
			},
		},
	),
) as unknown as DefaultTheme;
