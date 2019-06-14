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

import {
	Actions,
	Title,
	TitleIcon,
	TitleContainer,
	LoaderContainer
} from './viewerPanel.styles';
import { Panel } from '../../../components/panel/panel.component';
import { Loader } from '../../../components/loader/loader.component';
import { renderWhenTrue } from '../../../../helpers/rendering';

const ViewerPanelTitle = ({title, Icon, renderActions}) => (
	<TitleContainer>
		<Title> {Icon && <TitleIcon>{Icon}</TitleIcon>} {title} </Title>
		{renderActions && renderActions()}
	</TitleContainer>
);

interface IProps {
	title: string;
	Icon?: JSX.Element;
	pending?: boolean;
	renderActions?: () => JSX.Element | JSX.Element[];
}

export class ViewerPanel extends React.PureComponent<IProps, any> {
	public renderContent = renderWhenTrue(() => (
		<>{this.props.children}</>
	));

	public renderLoader = renderWhenTrue(() => (
		<LoaderContainer className="height-catcher">
			<Loader />
		</LoaderContainer>
	));

	public renderTitleActions = renderWhenTrue(() => (
		<Actions>
		{this.props.renderActions()}
		</Actions>
	));

	public renderTitle = () => (
		<ViewerPanelTitle
			title={this.props.title}
			Icon={this.props.Icon}
			renderActions={() => this.renderTitleActions(this.props.renderActions)}
		/>
	)

	public render() {
		const { pending } = this.props;

		return (
			<Panel title={this.renderTitle()}>
				{this.renderLoader(pending)}
				{this.renderContent(!pending)}
			</Panel>
		);
	}
}
