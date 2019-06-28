/**
 *  Copyright (C) 2019 3D Repo Ltd
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

import * as React from 'react';

import { ExternalLinksList, ExternalLink } from './externalLinks.styles';
import { STATIC_ROUTES } from '../../../services/staticPages';
import { LANDING_PAGES } from './externalLinks.constants';

const links = [
	...STATIC_ROUTES,
	...LANDING_PAGES
];

export const ExternalLinks = () => (
	<ExternalLinksList>
		{links.map(({ path, title }, index) => (
			<ExternalLink key={index} href={path}>{title}</ExternalLink>
		))}
	</ExternalLinksList>
);
