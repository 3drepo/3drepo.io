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
import { css } from 'styled-components';
import { Header } from '@controls/modal/formModal/formDialog.styles';
import { DialogTabs, NeutralActionButton, VisualSettingsButtonsContainer } from '@/v4/routes/components/topMenu/components/visualSettingsDialog/visualSettingsDialog.styles';
import { FieldsRow, StyledFormControl } from '@/v4/routes/viewerGui/components/risks/components/riskDetails/riskDetails.styles';
import { ResourceIconContainer, IconButton } from '@/v4/routes/components/resources/resources.styles';
import { LabelButton } from '@/v4/routes/viewerGui/components/labelButton/labelButton.styles';
import { labelButtonPrimaryStyles } from '@controls/button/button.styles';
import {
	Container as AttachResourcesMainContainer,
	Content,
	AddLinkContainer,
	ResourceListItem,
	ResourcesListContainer,
	ResourcesListScroller,
	StyledDropZone,
} from '@/v4/routes/components/resources/attachResourcesDialog/attachResourcesDialog.styles';
import { LoaderContainer } from '@/v4/routes/components/messagesList/messagesList.styles';

const AttachResourcesContainer = css`
	${Header} {
		position: relative;
	}

	.MuiDialogContent-root {
		padding: 0px;
		overflow-x: hidden;
	}

	${DialogTabs} {
		padding-left: 10px;
		box-shadow: 0px 1px 10px rgba(23, 43, 77, 0.15);
	}

	${VisualSettingsButtonsContainer} {
		display: flex;
		justify-content: flex-end;
		position: unset;
		box-shadow: 0px 6px 10px rgb(0 0 0 / 14%),
					0px 1px 18px rgb(0 0 0 / 12%),
					0px 3px 5px rgb(0 0 0 / 20%);
		padding: 8px;
		box-sizing: border-box;

		${NeutralActionButton} {
			color: ${({ theme }) => theme.palette.secondary.main};
			background-color: transparent;
			border: solid 1px currentColor;

			&:hover {
				background-color: ${({ theme }) => theme.palette.secondary.main};
				border-color: ${({ theme }) => theme.palette.secondary.main};
				color: ${({ theme }) => theme.palette.primary.contrast};
			}

			&:active {
				background-color: ${({ theme }) => theme.palette.secondary.dark};
				border-color: ${({ theme }) => theme.palette.secondary.dark};
				color: ${({ theme }) => theme.palette.primary.contrast};
			}
		}
	}

	${AttachResourcesMainContainer} {
		background-color: ${({ theme }) => theme.palette.tertiary.lightest};
		width: 520px;
		
		${Content} {
			min-height: 160px;
		}
	}
`;

const buttonsStyling = css`
	${IconButton} { 
		padding: 2px 0 0 0;
		height: fit-content;

		&:hover {
			background-color: transparent;
		}
		
		svg {
			color: ${({ theme }) => theme.palette.secondary.main};
			font-size: 19px;
		} 
	}
`;

const AttachResourcesFile = css`
	${LoaderContainer} {
		padding-top: 20px;
	}

	${ResourceListItem} {
		line-height: 14px;
		color: ${({ theme }) => theme.palette.primary.main};
		text-decoration: underline;
		text-underline-offset: 2px;
		white-space: nowrap;
		max-width: 185px;


		${buttonsStyling}
	}

	${StyledDropZone} {
		padding: 27px 0 28px;
		margin: 0 23px;
		// TODO - fix after new palette is released
		border-top: solid 1px #e0e5f0;
	}

	// style the icon 
	${FieldsRow} {
		flex-direction: row;

		${StyledFormControl} {
			&:nth-child(odd) {
				margin-right: 10px;
			}

			&:nth-of-type(even) {
				flex-direction: row;
				justify-content: flex-end;

				& > *:not(${ResourceIconContainer}) {
					width: 100%;
				}

				${ResourceListItem} {
					width: 100%;
					white-space: nowrap;
					max-width: 228px;


					button {
						width: fit-content;
					}
				}

				${ResourceIconContainer} svg {
					font-size: 18px;
					margin: 2px 4px 0 6px;
					color: ${({ theme }) => theme.palette.primary.main};
				}
			}
		}
	}
`;

const AttachResourcesLink = css`
	${ResourcesListScroller} {
		margin-top: 0px;
		overflow-y: overlay;
		max-height: 207px;

		${ResourcesListContainer} {
			width: 100%;
			box-sizing: border-box;
			padding: 0 23px;
			display: flex;
			flex-direction: column-reverse;

			${FieldsRow} {
				min-height: 35px;

				& > * {
					height: fit-content;
					
					&:nth-child(odd) {
						flex-grow: 5;
					}
	
					&:nth-child(even) {
						flex-grow: 6;
					}
				}

				.MuiFormHelperText-contained {
					position: unset;
				}

				&:last-of-type {
					margin-top: 20px;
				}

				button {
					margin: 0;
					margin-left: 21px;
					width: fit-content;
				}
			}
		}
		
		${buttonsStyling}
	}

	${AddLinkContainer} {
		padding: 28px 0;
		margin: 0 23px;
		// TODO - fix after new palette is released
		border-top: solid 1px #e0e5f0;

		${LabelButton} {
			${labelButtonPrimaryStyles}
			text-decoration: none !important;
			padding: 4px 19px;
			margin: 0;
			border-radius: 5px;
		}
	}
`;

// used in the attach resources modal styling file
export default css`
	${AttachResourcesContainer}
	${AttachResourcesLink}
	${AttachResourcesFile}
`;
