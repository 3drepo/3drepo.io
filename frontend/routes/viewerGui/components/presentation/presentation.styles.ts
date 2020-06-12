import styled from 'styled-components';

import { Grid, TextField } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import {
	VIEWER_PANELS,
	VIEWER_PANELS_ICONS,
	VIEWER_PANELS_MIN_HEIGHTS,
	VIEWER_PANELS_TITLES
} from '../../../../constants/viewerGui';
import { COLOR } from '../../../../styles';
import { ViewerPanel } from '../viewerPanel/viewerPanel.component';

export const PresentationContainer = styled(ViewerPanel).attrs({
	title: VIEWER_PANELS_TITLES[VIEWER_PANELS.PRESENTATION],
})`
	min-height: ${VIEWER_PANELS_MIN_HEIGHTS[VIEWER_PANELS.PRESENTATION]}px;
	max-height: 150px;

`;

export const StyledButton = styled(Button)`
	margin: 8px;
`;

export const CreateSessionSection = styled.div`
	text-align: center;
	margin: 20px;
`;

export const Content = styled.div`
	color: ${COLOR.BLACK_60};
	font-family: Roboto,'Helvetica Neue',sans-serif;
	font-size: 14px;
`;

export const JoinPresentationSection = styled.div`
	border-bottom-style: solid;
	border-color: ${COLOR.BLACK_16};
	padding: 20px;
	border-width: 1px;
`;

export const StyledTextfield = styled(TextField)`
	&& {
		margin-top: -10px;
		margin-right: 18px;
		width: 257px;
	}
`;
