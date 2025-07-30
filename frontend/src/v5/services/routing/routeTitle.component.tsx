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

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentRevision } from '@/v4/modules/model/model.selectors';
import { ProjectsHooksSelectors, ContainersHooksSelectors, FederationsHooksSelectors } from '@/v5/services/selectorsHooks';
import { formatMessage } from '../intl';
import { useParams } from 'react-router-dom';

export type RouteProps = {
	computedMatch?: any;
	title?: string;
	children: any;
};

const DEFAULT_TITLE = formatMessage({ id: 'pageTitle.default', defaultMessage: '3D Repo | Online BIM collaboration platform' });
const LOADING_TEXT = formatMessage({ id: 'pageTitle.loading', defaultMessage: 'Loading...' });

export const RouteTitle = ({ title = '', children }: RouteProps) => {
	const params = useParams();
	const projectName = ProjectsHooksSelectors.selectCurrentProjectName();
	const containerName = ContainersHooksSelectors.selectContainerById(params.containerOrFederation)?.name;
	const federationName = FederationsHooksSelectors.selectFederationById(params.containerOrFederation)?.name;
	const containerOrFederationName = containerName || federationName || '';
	const revisionTag = useSelector(selectCurrentRevision)?.tag || LOADING_TEXT;

	const PARAM_REGEX = /:(\S+)/g;

	const titleParsed = title.replace(PARAM_REGEX, (_, match) => {
		switch (match) {
			case 'project':
				return projectName || LOADING_TEXT;
			case 'revision':
				return params.revision ? `(${revisionTag})` : '';
			case 'containerOrFederation':
				return containerOrFederationName || LOADING_TEXT;
			default:
				return params[match] || '';
		}
	});

	useEffect(() => {
		if (titleParsed) {
			document.title = titleParsed;
		}
		return () => {
			document.title = DEFAULT_TITLE;
		};
	}, [titleParsed]);

	return children;
};
