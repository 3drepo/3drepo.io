import { StyledTab, StyledTabs, TabContent } from '@/v4/routes/viewerGui/components/risks/components/riskDetails/riskDetails.styles';
import { css } from 'styled-components';
import safetiBaseRisk from './risk.overrides';

export default css`
	${StyledTabs} {
		width: auto;
		left: 0;
		${StyledTab} {
			font-size: 13px;
		}
	}
	
	.MuiTabScrollButton-root {
		display: none;
	}
	${TabContent} {
		padding: 0 15px;
		/* TODO - fix after new palette is released */
		background-color: #F7F8FA;
		
		${safetiBaseRisk}
	}
`;
