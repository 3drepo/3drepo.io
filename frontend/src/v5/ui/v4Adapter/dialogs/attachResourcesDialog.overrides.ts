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
import { DialogTabs, NeutralActionButton, VisualSettingsButtonsContainer } from '@/v4/routes/components/topMenu/components/visualSettingsDialog/visualSettingsDialog.styles';
import { FieldsRow, StyledFormControl } from '@/v4/routes/viewerGui/components/risks/components/riskDetails/riskDetails.styles';
import { ResourceIconContainer, IconButton } from '@/v4/routes/components/resources/resources.styles';
import { LabelButton } from '@/v4/routes/viewerGui/components/labelButton/labelButton.styles';
import { primaryButtonStyling } from '@/v5/ui/v4Adapter/resuableOverrides.styles';
import {
	Container as AttachResourcesMainContainer,
	Content,
	AddLinkContainer,
	ResourceListItem,
	ResourcesListContainer,
	ResourcesListScroller,
	DropZone,
} from '@/v4/routes/components/resources/attachResourcesDialog/attachResourcesDialog.styles';
import { LoaderContainer } from '@/v4/routes/components/messagesList/messagesList.styles';

const AttachResourcesContainer = css`
	${DialogTabs} {
		padding-left: 10px;
		margin: -30px -30px 0;
		width: unset;
		box-shadow: 0px 1px 10px rgba(23, 43, 77, 0.15);
	}

	${VisualSettingsButtonsContainer} {
		display: flex;
		justify-content: flex-end;
		position: unset;
		padding: 8px;
		margin: 0 -30px -30px;
		width: unset;
		box-sizing: border-box;
		background-color: ${({ theme }) => theme.palette.tertiary.lighter};

		${NeutralActionButton} {
			color: ${({ theme }) => theme.palette.secondary.main};
			background-color: transparent;

			&:hover, &:active {
				text-decoration: underline;
			}
		}
	}

	${AttachResourcesMainContainer} {
		background-color: ${({ theme }) => theme.palette.tertiary.lightest};
		width: 520px;
		
		${Content} {
			min-height: 160px;
			margin: 0 -30px;
			width: 520px;
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

	${DropZone} {
		padding: 27px 0 28px;
		margin: 0 23px;
		border-top: solid 1px ${({ theme }) => theme.palette.base.lightest};
	}

	// style the icon 
	${Content} ${FieldsRow} {
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
				min-height: 51px;

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

				&:first-of-type {
					margin-bottom: 2px;
				}

				&:last-of-type {
					margin-top: 18px;
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

		${LabelButton} {
			${primaryButtonStyling}
			text-decoration: none !important;
			padding: 4px 19px;
			margin: 0;
			border-radius: 8px;
		}
	}
`;

// used in the attach resources modal styling file
export default css`
	${AttachResourcesContainer}
	${AttachResourcesLink}
	${AttachResourcesFile}
`;
