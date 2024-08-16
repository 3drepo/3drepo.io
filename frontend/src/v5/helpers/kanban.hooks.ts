/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { formatMessage } from '../services/intl';
import { TeamspacesHooksSelectors } from '../services/selectorsHooks';

export const useKanbanNavigationData = () => {
	const issuesEnabled = TeamspacesHooksSelectors.selectIssuesEnabled();
	const riskEnabled = TeamspacesHooksSelectors.selectRisksEnabled();
	const fetchingAddons = TeamspacesHooksSelectors.selectIsFetchingAddons();
	const issuesOrRisksEnabled = issuesEnabled || riskEnabled;
	const shouldRenderContent = fetchingAddons || issuesOrRisksEnabled;
	const shouldRenderLink = !fetchingAddons && issuesOrRisksEnabled;

	let title = ':project';
	let linkLabel = '';
	
	if (issuesEnabled && !riskEnabled) {
		title = formatMessage({ id: 'pageTitle.issues', defaultMessage: ':project - Issues' });
		linkLabel = formatMessage({ id: 'projectNavigation.issuesLinkLabel', defaultMessage: 'Issues' });
	}

	if (!issuesEnabled && riskEnabled) {
		title = formatMessage({ id: 'pageTitle.risks', defaultMessage: ':project - Risks' });
		linkLabel = formatMessage({ id: 'projectNavigation.risksLinkLabel', defaultMessage: 'Risks' });
	}

	if (issuesEnabled && riskEnabled) {
		title = formatMessage({ id: 'pageTitle.issuesAndRisks', defaultMessage: ':project - Issues and risks' });
		linkLabel = formatMessage({ id: 'projectNavigation.issuesAndRisksLinkLabel', defaultMessage: 'Issues and risks' });
	}


	return { title, linkLabel, shouldRenderContent, shouldRenderLink, issuesOrRisksEnabled, issuesEnabled, riskEnabled };
};