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

import { ActionsLine, StyledMarkdownField, StyledTextField } from '@/v4/routes/components/textField/textField.styles';
import { StyledButton } from '@/v4/routes/viewerGui/components/containedButton/containedButton.styles';
import { DescriptionImage } from '@/v4/routes/viewerGui/components/issues/components/issueDetails/issueDetails.styles';
import { DateFieldContainer } from '@/v4/routes/viewerGui/components/issues/components/mainIssueFormTab/mainIssueFormTab.styles';
import { StyledFormControl } from '@/v4/routes/viewerGui/components/risks/components/riskDetails/riskDetails.styles';
import { Container as ButtonContainer } from '@/v4/routes/viewerGui/components/pinButton/pinButton.styles';
import { UpdateButtonsContainer } from '@/v4/routes/viewerGui/components/updateButtons/updateButtons.styles';
import { css } from 'styled-components';

export default css`
	.description {
		margin: 14px 0;
		${StyledTextField} {
			margin: 0;
		}
		label {
			font-size: 12px;
			transform: scale(1);
			left: 1px;
			top: -18px;
		}
		.MuiFormControl-root {
			margin-top: 0;
		}
		.MuiInputBase-root {
			padding: 0;
			>textarea {
				min-height: 2rem;
				padding: 5px 10px;
			}
		} 
		button {
			margin: 8px 4px 2px 0;
		}
	}

	${StyledMarkdownField} {
		border: 1px solid #C1C8D5; // TODO: fix after new palette is released
		border-radius: 5px;
		min-height: 32px;
		padding: 4px 10px;
		margin-top: 0px;
		margin-bottom: 0px;
		font-size: 0.75rem;
		background-color: ${({ theme }) => theme.palette.primary.contrast};
		p {
			margin: 0;
		}
	}

	// Drop-down inputs
	${StyledFormControl} {
		label { left: -14px; }
		.MuiInput-root svg { margin-top: 23px; }

		// Drop down icon for date selector
		.MuiInputAdornment-root {
			position: absolute;
			cursor: pointer;
			pointer-events: none;
			right: 8px;
			svg {
				height: 20px;
			}
		}
	}

	${ActionsLine} {
		bottom: 4px;
		right: 0;
	}

	${DescriptionImage} {
		border-radius: 5px;
	}

	${DateFieldContainer} {
		margin-top: 27px;
		input {
			cursor: pointer;
			height: 24px;
		}
	}

	${UpdateButtonsContainer} {
		justify-content: left;
		${StyledButton} {
			margin: 0;
		}

		${ButtonContainer} {
			min-height: 26px;
		}
	}
`;
