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
import { StyledChipInput } from '@/v4/routes/components/chipsInput/chipsInput.styles';
import { Content as LoadingText } from '@/v4/routes/components/loader/loader.styles';
import { Container as Panel, Title } from '@/v4/routes/components/panel/panel.styles';
import { FileLabel } from '@/v4/routes/teamspaceSettings/components/fileInputField/fileInputField.styles';
import { ButtonContainer,
	CreateMitigationsGrid,
	DataText,
	FileGrid,
	Headline,
	LoaderContainer,
	StyledButton,
	StyledForm,
	StyledGrid,
	StyledIconButton,
	SuggestionsContainer,
} from '@/v4/routes/teamspaceSettings/teamspaceSettings.styles';
import styled from 'styled-components';

export const V5TeamspaceSettingsOverrides = styled.div<{ isAdmin: boolean }>`
	${Panel} {
		border: none;
		box-shadow: none;
		background-color: transparent;
		height: unset;
		${LoaderContainer} {
			padding: 50px 0;
			${LoadingText} {
				color: ${({ theme }) => theme.palette.base.main};
				${({ theme }) => theme.typography.h4};
			}
		}
		${Title} {
			display: none;
		}
		${StyledForm} {
			overflow-y: hidden;
			padding: 0;
			.MuiAutocomplete-popper {
				display: none;
			}
			${StyledGrid} {
				padding: 0 0 30px 0;
				&${StyledGrid}:first-of-type {
					display: none;
				}
			}
			${Headline} {
				${({ theme }) => theme.typography.h5};
				color: ${({ theme }) => theme.palette.secondary.main};
			}
			
			${StyledChipInput} {
				margin-top: 0;
				.MuiAutocomplete-inputRoot {
					padding: 0;
					background-color: transparent;
					.MuiAutocomplete-tag {
						background-color: ${({ theme }) => theme.palette.primary.contrast};
						color: ${({ theme }) => theme.palette.secondary.main};
						border-radius: 5px;
						font-weight: 600;
						font-size: 12px;
						height: 30px;
						padding: 7px 10px;
						.MuiChip-label {
							padding: 0;
						}
						svg {
							margin: 0 0 0 5px;
							color: ${({ theme }) => theme.palette.secondary.main};
							display: ${({ isAdmin }) => (isAdmin ? 'block' : 'none')};
						}
					}
					.MuiInputBase-input {
						color: ${({ theme }) => theme.palette.secondary.main};
						display: ${({ isAdmin }) => (isAdmin ? 'block' : 'none')};
					}
				}
				fieldset, &:hover fieldset, .Mui-focused fieldset {
					border: none;
					box-shadow: none;
				}
			}
			${SuggestionsContainer} {
				padding: 0;
				display: ${({ isAdmin }) => (isAdmin ? 'block' : 'none')};
				${FileGrid} {
					width: max-content;
					height: 40px;
					${DataText} {
						color: ${({ theme }) => theme.palette.base.main};
					}
					${FileLabel} {
						margin: 0;
					}
					${StyledIconButton}, ${StyledButton} {
						padding: 0;
						margin: 0 10px;
						svg {
							color: ${({ theme }) => theme.palette.secondary.main};
						}
						&.Mui-disabled svg {
							color: ${({ theme }) => theme.palette.base.lightest};
						}
					}
				}
			}
			${CreateMitigationsGrid} {
				width: 320px;
			}
			${ButtonContainer} {
				width: 84px;
				height: 51px;
				background-color: transparent;
				right: 0;
				bottom: -8px;
				display: ${({ isAdmin }) => (isAdmin ? 'block' : 'none')};
				
				button:not(.Mui-disabled) {
					background-color: ${({ theme }) => theme.palette.primary.main};
					color: ${({ theme }) => theme.palette.primary.contrast};
					:hover {
						background-color: ${({ theme }) => theme.palette.primary.dark};
					}
				}
			}
		}
	}
`;
