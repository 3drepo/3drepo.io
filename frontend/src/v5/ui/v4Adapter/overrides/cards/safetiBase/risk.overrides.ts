import { Header } from '@/v4/routes/viewerGui/components/risks/components/levelOfRisk/levelOfRisk.styles';
import { DateFieldContainer } from '@/v4/routes/viewerGui/components/risks/components/mainRiskFormTab/mainRiskFormTab.styles';
import { DescriptionImage, FieldsContainer, FieldsRow, StyledFormControl } from '@/v4/routes/viewerGui/components/risks/components/riskDetails/riskDetails.styles';
import { css } from 'styled-components';

export default css`
	${DescriptionImage} img {
		border-radius: 5px;
	}
	${FieldsRow} {
		.MuiFormControl-root {
			padding-top: 25px;
			.MuiFormControl-root {
				padding: 0;
			}
		}
		.MuiInputBase-input, .MuiSelect-select, .MuiOutlinedInput-notchedOutline {
			box-sizing: border-box;
			margin: 0;
			color: ${({ theme }) => theme.palette.secondary.main};
			~ svg {
				margin-top: -2px
			}
		}
		input, fieldset {
			margin: 0;
		}
		${StyledFormControl} {
			margin: 0;
			&:first-child {
				margin-right: 5px;
			}
			&:last-child {
				margin-left: 5px;
			}
			${DateFieldContainer} {
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
					margin-top: -13px;
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
