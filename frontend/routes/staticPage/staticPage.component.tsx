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
import { clientConfigService } from '../../services/clientConfig';

interface IProps {
	match: any;
}

export class StaticPage extends React.PureComponent<IProps, any> {
	public getFile = (fileName) => require(`./../../staticPages/legal/${fileName}`);

	public render() {
		const { match } = this.props;

		return clientConfigService.legalTemplates.map((page) => (
			<Route
				key={page.page}
				path={`${match.url}${page.page}`}
				render={() =>
					<PageTemplate title={page.title}>
						{this.getFile(page.fileName)}
					</PageTemplate>
				}
			/>
		));
	}
}
