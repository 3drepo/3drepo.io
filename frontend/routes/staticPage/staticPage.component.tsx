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
import CookiesTemplate from './pages/cookies.html';
import { PageTemplate } from './components/pageTemplate/pageTemplate.component';

interface IProps {
	match: any;
}

export class StaticPage extends React.PureComponent<IProps, any> {

	public componentDidMount() {
		console.log('componentDidMount');
	}

	public render() {
		const { match } = this.props;
		console.log('CookiesTemplate', CookiesTemplate);
		return (
			<>
				<Route path={`${match.url}cookies`} render={() =>
					<PageTemplate title="Cookies">
						{`
							<div id="legalText">
								<div>
									<p>Hello html cookies in react!</p>
									<span>cookies span</span>
								</div>
							</div>
						`}
					</PageTemplate>}
				/>
				<Route path={`${match.url}terms`} render={() =>
					<PageTemplate title="Terms">
						{`
							<div id="legalText">
								<div>
									<p>Hello html terms in react!</p>
									<span>terms span</span>
								</div>
							</div>
						`}
					</PageTemplate>}
				/>
				<Route path={`${match.url}privacy`} render={() =>
					<PageTemplate title="Privacy">
						{`
							<div id="legalText">
								<div>
									<p>Hello html privacy in react!</p>
									<span>privacy span</span>
								</div>
							</div>
						`}
					</PageTemplate>}
				/>
			</>);
	}
}
