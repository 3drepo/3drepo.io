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

import { Container as GroupDetails,
	Actions as BottomLeftButtons,
	Description as DetailsDescription,
	StyledTextField,
	StyledFormControl,
} from '@/v4/routes/viewerGui/components/groups/components/groupDetails/groupDetails.styles';
import {
	Container as PreviewListItemContainer,
	Content as PreviewListItemContent,
	RoleIndicator,
	Description,
} from '@/v4/routes/viewerGui/components/previewListItem/previewListItem.styles';
import { Status, ExtraInfo } from '@/v4/routes/viewerGui/components/previewItemInfo/previewItemInfo.styles';
import { css } from 'styled-components';
import { ColorSelect } from '@/v4/routes/components/colorPicker/colorPicker.styles';
import { Container as PreviewDetailsContainer,
	CollapsableContent,
	NotCollapsableContent,
	MainInfoContainer,
} from '@/v4/routes/viewerGui/components/previewDetails/previewDetails.styles';
import { Container as FiltersContainer,
	ChipsContainer,
	InputLabel,
	SelectedCriteria,
	FormContainer,
	ButtonContainer,
	FormControl,
} from '@/v4/routes/components/criteriaField/criteriaField.styles';
import {
	StyledTextField as TitleTextField,
	Container as TextFieldContainer,
	FieldWrapper,
	StyledLinkableField,
	ActionsLine,
} from '@/v4/routes/components/textField/textField.styles';
import { labelButtonPrimaryStyles } from '@controls/button/button.styles';
import { ViewerPanelContent } from '@/v4/routes/viewerGui/components/viewerPanel/viewerPanel.styles';
import { StyledTextField as AutoSuggestField } from '@/v4/routes/components/autosuggestField/autosuggestField.styles';
import { MultipleInputsContainer } from '@/v4/routes/components/criteriaField/components/criteriaValueField/criteriaValueField.styles';

const previewGroupItem = css`
	${PreviewListItemContainer} {
		padding: 7px;
	}

	${PreviewListItemContent} {
		margin: 5px 0 0;
	}

	${RoleIndicator} {
		display: inline-block;
		border: none;
		width: 8px;
		margin-right: 10px;
	}
	
		
	${Status} {
		svg {
			display: inline-block;
			font-size: 15px;
		}

		&::before {
			display: none;
		}
	}

	${Description} {
		font-size: 10px;

		&, ${ExtraInfo} {
			color: ${({ theme }) => theme.palette.base.main};
			font-weight: 500;
		}
	}

	${ExtraInfo} {
		font-size: 9px;
	}
`;

const expandedGroupItem = css`
	${MainInfoContainer} ${TitleTextField} {
		margin: 1px 0;
	}

	.MuiChip-root {
		&:hover, 
		&:active {
			background-color: ${({ theme }) => theme.palette.tertiary.lightest};
			box-shadow: none;
		}

		.MuiChip-deleteIcon:hover {
			color: ${({ theme }) => theme.palette.base.light};
		}
	}

	${GroupDetails} {
		${PreviewDetailsContainer} {
			/* TODO - fix after new palette is released */
			background-color: #F7F8FA;
		}

		.MuiAccordionDetails-root {
			${CollapsableContent} {
				padding: 10px;
				label {
					font-size: 10px;
				}
				.MuiFormControl-root {
					margin-top: -18px;
				}
				${TextFieldContainer} {
					border: 1px solid ${({ theme }) => theme.palette.base.lightest};
					border-radius: 5px;
					background-color: ${({ theme }) => theme.palette.primary.contrast};

					label {
						transform: scale(1);
						left: 1px;
						top: -18px;
						position: absolute;
					}

					.MuiFormControl-root {
						margin-top: 0;
					}
					
					.MuiInputBase-root {
						padding: 0;
						& > textarea {
							min-height: 2rem;
							padding: 5px 10px;
						}
						&.Mui-focused fieldset {
							border: 1px solid ${({ theme }) => theme.palette.primary.main};
							box-shadow: 0 0 2px ${({ theme }) => theme.palette.primary.main};
						}
						fieldset {
							border: none;
							box-shadow: none;
						}
					}

					${FieldWrapper} {
						-webkit-text-fill-color: none;

						:after {
							border: none;
						}
						${StyledLinkableField} {
							margin: 0 10px;
							line-height: 24px;
							font-size: 12px;
						}
					}
				}
				${StyledFormControl} {
					.MuiSelect-select {
						margin-top: 0;
						color: ${({ theme }) => theme.palette.secondary.main};
						~ svg {
							margin-top: 0;
						}
					}
					label {
						top: -16px;
						transform: none;
						font-size: 10px;
						left: 1px;
					}
				}
				${DetailsDescription} {
					margin-top: 30px;
					
					> div {
						min-height: 42px !important;
						margin: 0;
					}
					
					span {
						display: table;
						word-break: break-all;
						height: 24px;
						line-height: unset !important;
						padding-top: 5px;
					}

					.MuiFormHelperText-root {
						top: unset;
						bottom: -21px;
					}

					${ActionsLine} {
						top: -5px;
						bottom: unset;
						
						svg {
							font-size: 1rem;
						}
					}
				}

				${StyledTextField} {
					margin: 0 10px 0 0;
					background-color: ${({ theme }) => theme.palette.primary.contrast};
				}
			}
		}
		${NotCollapsableContent} {
			padding: 15px 0 0;
			${FiltersContainer} {
				border: none;
				background-color: #F7F8FA; // TODO - fix after new palette is released

				${InputLabel} {
					padding: 0 15px;
					top: 23PX;
					left: 0;
				}
				${SelectedCriteria} {
					padding: 5px 15px 12px;
					${ChipsContainer} {
						padding-top: 20px;
					}
					${ButtonContainer} {
						bottom: 6px;
					}
				}
				// Field / Operation / Value box area
				${FormContainer} {
					border: none;
					/* TODO - fix after new palette is released */
					background-color: #F7F8FA;
					color: ${({ theme }) => theme.palette.base.lighter};
					border-top: 1px solid ${({ theme }) => theme.palette.base.lightest};
					padding: 12px 15px;
					
					${AutoSuggestField} {
						margin: 0;

						.MuiTextField-root {
							margin: 0;
						}
					}

					${MultipleInputsContainer} {
						margin: 0;
					}

					.MuiTextField-root {
						margin-top: 0;
					}

					.MuiButton-contained {
						${labelButtonPrimaryStyles}

						&.Mui-disabled {
							color: ${({ theme }) => theme.palette.primary.contrast};
							background-color: ${({ theme }) => theme.palette.base.lightest};
						}

						margin: -12px 0 0 0;
					}

					${FormControl} {
						margin: 0 0 11px;

						& ::placeholder {
							// TODO - fix after new palette is released
							-webkit-text-fill-color: ${({ theme }) => theme.palette.base.lighter};
							font-weight: 400;
						}

						&:last-of-type {
							margin-bottom: 0;
						}

						label {
							transform: none;
							font-size: 10px;
							top: -2px;
							left: 1px;
						}

						.MuiInputBase-input {
							height: 24px;
							color: ${({ theme }) => theme.palette.secondary.main};
						}
						&.operation {
							.MuiInputBase-root {
								.MuiSelect-select {
									margin-top: 0;
									padding-left: 12px;
									~ svg {
										margin-top: 0;
										color: ${({ theme }) => theme.palette.base.lighter};
									}
								}
							}
						}
					}
				}
			}
		}
	}

	// footer 
	${BottomLeftButtons} {
		${ColorSelect} {
			background-color: transparent;
			border-bottom: none;
		}

		button {
			&, &:hover {
				background-color: transparent;
			}
		}
	}
`;

export default css`
	#groups-card {
		${previewGroupItem}
		${ViewerPanelContent} {
			background-color: ${({ theme }) => theme.palette.tertiary.lightest};
		}
	}

	#groups-card-details {
		${expandedGroupItem}
	}
`;
