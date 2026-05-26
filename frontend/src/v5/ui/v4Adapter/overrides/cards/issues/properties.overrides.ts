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
import { ActionsLine } from '@/v4/routes/components/textField/textField.styles';
import { DescriptionImage, Content as PropertiesTabContent } from '@/v4/routes/viewerGui/components/issues/components/issueDetails/issueDetails.styles';
import { DateFieldContainer as IssuesDateFieldContainer } from '@/v4/routes/viewerGui/components/issues/components/mainIssueFormTab/mainIssueFormTab.styles';
import { StyledFormControl } from '@/v4/routes/viewerGui/components/risks/components/riskDetails/riskDetails.styles';
import { Container as ButtonContainer } from '@/v4/routes/viewerGui/components/pinButton/pinButton.styles';
import { UpdateButtonsContainer } from '@/v4/routes/viewerGui/components/updateButtons/updateButtons.styles';

export default css`
	${PropertiesTabContent} {
		// Drop-down inputs
		${StyledFormControl} {
			input {
				padding: 0px 11px;
			}

			.MuiOutlinedInput-root {
				width: 100%;
			}

			// Drop down icon for date selector
			.MuiInputAdornment-root {
				position: absolute;
				cursor: pointer;
				pointer-events: none;
				right: 4px;

				svg {
					height: 20px;
				}
			}

			&:last-of-type:first-child {
				margin-right: 10px;
			}
		}

		${ActionsLine} {
			bottom: unset;
			top: 4px;
			right: 0;
		}

		${IssuesDateFieldContainer} {
			.MuiInputBase-root {
				padding: 0;
				input {
					height: 24px;
					color: ${({ theme }) => theme.palette.secondary.main};

					&:not(.Mui-disabled) {
						cursor: pointer;
					}
				}
			}
		}
		${DescriptionImage} img {
			border-radius: 8px;
		}
	
		${UpdateButtonsContainer} {
			justify-content: left;
			padding-top: 0;
	
			${ButtonContainer} {
				min-height: 26px;
			}
		}
	}

`;
