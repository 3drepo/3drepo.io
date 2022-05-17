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

import { GroupActions, GroupListItem } from '@/v4/routes/viewerGui/components/groups/groups.styles';
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
	Actions,
} from '@/v4/routes/viewerGui/components/previewListItem/previewListItem.styles';
import { Status, ExtraInfo } from '@/v4/routes/viewerGui/components/previewItemInfo/previewItemInfo.styles';
import { css } from 'styled-components';
import { ColorSelect } from '@/v4/routes/components/colorPicker/colorPicker.styles';
import { Container as PreviewDetailsContainer,
	CollapsableContent,
	NotCollapsableContent,
	ToggleButtonContainer,
} from '@/v4/routes/viewerGui/components/previewDetails/previewDetails.styles';
import { Container as FiltersContainer,
	ChipsContainer,
	InputLabel,
	SelectedCriteria,
	FormContainer,
	ButtonContainer,
	FormControl,
} from '@/v4/routes/components/criteriaField/criteriaField.styles';
import { Container as TextFieldContainer, FieldWrapper, StyledLinkableField } from '@/v4/routes/components/textField/textField.styles';

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

	${GroupListItem} {
		${Actions} {
			right: 10px;
		}

		${GroupActions} {
			button {
				margin: 0;
				padding: 8px;
				
				svg path {
					fill: currentColor;
				}

				&, &:hover {
					background-color: transparent;
				}
			}
		}
	}
`;

const expandedGroupItem = css`
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
			background-color: ${({ theme }) => theme.palette.primary.constrast};
			${CollapsableContent} {
				padding: 10px;
				label {
					font-size: 10px;
				}
				${TextFieldContainer} {
					/* TODO - fix after new palette is released */
					border: 1px solid #C1C8D5;
					border-radius: 5px;
					background-color: ${({ theme }) => theme.palette.primary.constrast};
					label {
						transform: scale(1);
						left: 1px;
						top: -18px;
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
						fieldset {
							border: none;
						}

					}
					${FieldWrapper} {
						height: 24px;
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
					fieldset {
						/* TODO - fix after new palette is released */
						border-color: #C1C8D5;
					}
					.MuiSelect-select {
						margin-top: 0;
						height: 26px;
						color: ${({ theme }) => theme.palette.secondary.main};
						font-size: 14px;
						~ svg {
							margin-top: 0;
						}
					}
					label {
						top: -16px;
						transform: none;
						font-size: 10px;
					}
				}
				${DetailsDescription} {
					margin-top: 30px;
					background-color: ${({ theme }) => theme.palette.primary.contrast};
					> div {
						height: 42px !important;
					}
				}
				${StyledTextField} {
					margin: 0 10px 0 0;
					background-color: ${({ theme }) => theme.palette.primary.contrast};
				}
			}
		}
		${ToggleButtonContainer} {
			background-color: ${({ theme }) => theme.palette.primary.constrast};
		}
		${NotCollapsableContent} {
			padding: 15px 0 0;
			${FiltersContainer} {
				border: none;
				background-color: #F7F8FA; // TODO - fix after new palette is released

				${InputLabel} {
					padding: 0 15px;
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
					color: #C1C8D5;
					border-top: 1px solid #E0E5F0;
					padding: 12px 15px;

					${FormControl} {
						margin: 0 0 11px;
						label {
							transform: none;
							font-size: 10px;
							top: -2px;
						}
						.MuiInputBase-input {
							height: 24px;
							color: ${({ theme }) => theme.palette.secondary.main};
						}
						&.operation {
							margin-top: -16px;
							.MuiInputBase-root {
								margin-top: 16px;
								.MuiSelect-select {
									margin-top: 0;
									padding-left: 8px;
									~ svg {
										margin-top: 0;
										/* TODO - fix after new palette is released */
										color: #C1C8D5;
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
	}

	#groups-card-details {
		${expandedGroupItem}
	}
`;
