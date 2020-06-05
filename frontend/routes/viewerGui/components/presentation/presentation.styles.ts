import styled from 'styled-components';

import {
	VIEWER_PANELS,
	VIEWER_PANELS_ICONS,
	VIEWER_PANELS_MIN_HEIGHTS,
	VIEWER_PANELS_TITLES
} from '../../../../constants/viewerGui';
import { ViewerPanel } from '../viewerPanel/viewerPanel.component';

export const PresentationContainer = styled(ViewerPanel).attrs({
	title: VIEWER_PANELS_TITLES[VIEWER_PANELS.PRESENTATION],
})`
	min-height: ${VIEWER_PANELS_MIN_HEIGHTS[VIEWER_PANELS.PRESENTATION]}px;
`;
