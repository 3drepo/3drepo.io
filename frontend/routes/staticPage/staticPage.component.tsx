/**
 *  Copyright (C) 2017 3D Repo Ltd
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
import { Route } from 'react-router-dom';

import { PageTemplate } from './components/pageTemplate/pageTemplate.component';

import CookiesPageContent = require('./../../staticPages/cookies.html');
import TermsPageContent = require('./../../staticPages/terms.html');
import PrivacyPageContent = require('./../../staticPages/privacy.html');

interface IProps {
	match: any;
}

const staticPages = [
	{
		title: 'Cookies',
		route: 'cookies',
		contentFile: CookiesPageContent
	},
	{
		title: 'Terms & Conditions',
		route: 'terms',
		contentFile: TermsPageContent
	},
	{
		title: 'Privacy',
		route: 'privacy',
		contentFile: PrivacyPageContent
	}
];

export class StaticPage extends React.PureComponent<IProps, any> {
	public render() {
		const { match } = this.props;

		return staticPages.map((page) => (
			<Route path={`${match.url}${page.route}`} key={page.route} render={() =>
				<PageTemplate title={ page.title }>
					{ page.contentFile }
				</PageTemplate>}
			/>
		));
	}
}
