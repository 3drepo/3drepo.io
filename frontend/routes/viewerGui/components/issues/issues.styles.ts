import styled from 'styled-components';

import {
	VIEWER_PANELS,
	VIEWER_PANELS_ICONS,
	VIEWER_PANELS_MIN_HEIGHTS,
	VIEWER_PANELS_TITLES
} from '../../../../constants/viewerGui';
import { ReportedItems } from '../reportedItems';

export const IssuesContainer = styled(ReportedItems).attrs({
	title: VIEWER_PANELS_TITLES[VIEWER_PANELS.ISSUES],
	Icon: VIEWER_PANELS_ICONS[VIEWER_PANELS.ISSUES] as any
})`
	min-height: ${VIEWER_PANELS_MIN_HEIGHTS[VIEWER_PANELS.ISSUES]}px;
	height: 100%;
` as any;
