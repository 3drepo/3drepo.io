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
import { MuiThemeProvider } from '@material-ui/core/styles';
import { ThemeProvider } from 'styled-components';
import { MuiTheme, theme } from './../../../../styles';
import { Container, Content, Header, Logo, Title } from './pageTemplate.styles';

interface IProps {
	title: string;
	fileName: string;
	isPending: boolean;
	templates: object;
	loadTemplate: (fileName) => void;
}

export class PageTemplate extends React.PureComponent<IProps, any> {
	public async componentDidMount() {
		this.props.loadTemplate(this.props.fileName);
	}

	public render() {
		const { templates, fileName } = this.props;
		console.log('templates', templates);
		return (
			<ThemeProvider theme={theme}>
				<MuiThemeProvider theme={MuiTheme}>
					<Container>
						<Header>
							<Title>{this.props.title}</Title>
							<Logo src="images/3drepo-logo-white.png" alt="3D Repo" />
						</Header>
						<Content dangerouslySetInnerHTML={{ __html: templates[fileName] }} />
					</Container>
				</MuiThemeProvider>
			</ThemeProvider>
		);
	}
}
