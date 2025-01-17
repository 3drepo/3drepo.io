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
import { Header } from '@/v4/routes/viewerGui/components/risks/components/levelOfRisk/levelOfRisk.styles';
import { DateFieldContainer as RisksDateFieldContainer } from '@/v4/routes/viewerGui/components/risks/components/mainRiskFormTab/mainRiskFormTab.styles';
import { DateFieldContainer as IssuesDateFieldContainer } from '@/v4/routes/viewerGui/components/issues/components/mainIssueFormTab/mainIssueFormTab.styles';
import { StyledFormControl, FieldsContainer, FieldsRow } from '@/v4/routes/viewerGui/components/risks/components/riskDetails/riskDetails.styles';
import { ActionsLine, StyledMarkdownField, StyledTextField } from '@/v4/routes/components/textField/textField.styles';

export const EditableFieldStyles = css`
	margin: 14px 0;

	${StyledTextField} {
		margin: 0;
	}

	label {
		font-size: 10px;
		transform: scale(1);
		left: 1px;
		top: -18px;
		position: absolute;
	}

	.MuiFormControl-root {
		margin-top: 0;

		.MuiInputBase-root {
			padding: 0;

			& > textarea {
				min-height: 2rem;
				padding: 5px 20px 5px 10px;
			}

			.MuiOutlinedInput-notchedOutline {
				height: calc(100%);
				min-height: 42px;
			}
		}
	}

	button {
		margin: 0 5px 2px 0;
		height: 15px;
		width: 15px;
		color: ${({ theme }) => theme.palette.secondary.main};

		&:hover {
			background-color: transparent;
		}

		svg {
			font-size: 1rem;
		}
	}

	${ActionsLine} {
		top: 4px;
		bottom: unset;
		right: 0;
		display: flex;
		flex-direction: column-reverse;
	}

	${StyledMarkdownField} {
		border: 1px solid ${({ theme }) => theme.palette.base.lighter};
		border-radius: 8px;
		min-height: 32px;
		padding: 4px 10px;
		box-sizing: unset;
		margin-top: 0px;
		margin-bottom: 0px;
		font-size: 0.75rem;
		background-color: ${({ theme }) => theme.palette.primary.contrast};

		p {
			margin: 0;
			max-width: calc(100% - 8px);
			text-overflow: ellipsis;
			overflow: hidden;
		}
	}
`;

export const FieldsRowStyles = css`
	${FieldsRow} {
		.MuiFormControl-root {
			padding-top: 7px;
			.MuiFormControl-root {
				padding: 0;
			}
		}
		.MuiInputBase-input, .MuiSelect-select, .MuiOutlinedInput-notchedOutline {
			box-sizing: border-box;
			margin: 0;
			~ svg {
				margin-top: 0px;
				top: 10px;
			}

			&:not(.Mui-disabled) {
				color: ${({ theme }) => theme.palette.secondary.main};
				~ svg {
					color: ${({ theme }) => theme.palette.secondary.main};
				}
			}
		}
		input, fieldset {
			margin: 0;
		}
		${StyledFormControl} {
			margin: 0;
			&:last-child {
				margin-left: 5px;
			}
			&:first-child {
				margin-right: 5px;
				margin-left: 0;
			}
			${IssuesDateFieldContainer},
			${RisksDateFieldContainer} {
				margin: 0;
				input, fieldset {
					margin-top: 0;
				}
			}
			label {
				top: 6px;
			}
			.MuiFormControl-root {
				label {
					top: -19px;
				}
			}
		}
		${FieldsContainer} {
			width: calc(50% - 5px);
			${StyledFormControl} {
				margin: 0;
				/* Level of risk */
				${Header} {
					font-size: 10px;
					color: ${({ theme }) => theme.palette.base.main};
				}
				label {
					top: 5px;
				}
			}
			label {
				font-size: 10px;
				top: -10px;
			}
		}
	}
`;

export default css`
	.description {
		${EditableFieldStyles}
	}
	${FieldsRowStyles}

	.MuiSelect-select {
		border: 1px solid ${({ theme }) => theme.palette.base.lightest};
	}

	.Mui-focused .MuiSelect-select {
		border-color: ${({ theme }) => theme.palette.primary.main};
	}
`;
