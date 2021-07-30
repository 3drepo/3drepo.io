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

import React from 'react';
import { getStaticFile } from '../../../services/staticPages';
import { MainMenu } from '../topMenu/components/mainMenu/mainMenu.component';
import { Container, Content, Header, Logo, MenuContainer, Title } from './staticPageRoute.styles';

interface IProps {
	title: string;
	fileName: string;
}

interface IState {
	fileContent: string;
}

export default class PageTemplate extends React.PureComponent<IProps, IState> {
	public state = {
		fileContent: ''
	};

	public componentDidMount() {
		getStaticFile(this.props.fileName).then(({data}) => this.setState({fileContent: data}));
	}

	public render() {
		const { fileContent } =  this.state;
		return (
			<Container>
				<Header>
					<Title>{this.props.title}</Title>
					<Logo src="images/3drepo-logo-white.png" alt="3D Repo" />
					<MenuContainer>
						<MainMenu isAuthenticated={false} />
					</MenuContainer>
				</Header>
				<Content dangerouslySetInnerHTML={{ __html: fileContent }} />
			</Container>
		);
	}
}
