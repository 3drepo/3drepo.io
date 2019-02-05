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
	Action,
	Actions,
	Title,
	TitleIcon,
	TitleContainer,
	ViewerPanelContent
} from './viewerPanel.styles';
import { Panel } from '../../../components/panel/panel.component';
import { Loader } from '../../../components/loader/loader.component';
import { renderWhenTrue } from '../../../../helpers/rendering';

const ViewerPanelTitle = ({title, Icon, renderActions}) => {
	return (
		<TitleContainer>
			<Title> {Icon && <TitleIcon>{Icon}</TitleIcon>} {title} </Title>
			{renderActions && renderActions()}
		</TitleContainer>
	);
};

interface IProps {
	title: string;
	Icon?: JSX.Element;
	actions?: any[];
	pending?: boolean;
}

export class ViewerPanel extends React.PureComponent<IProps, any> {
	public static defaultProps = {
		actions: []
	};

	public renderContent = renderWhenTrue(() => (
		<>{this.props.children}</>
	));

	public renderLoader = renderWhenTrue(() => (
		<ViewerPanelContent className="height-catcher" isPadding={true}>
			<Loader />
		</ViewerPanelContent>
	));

	public getTitle = () => {
		const { title, Icon, actions } = this.props;
		return (
			<ViewerPanelTitle
				title={title}
				Icon={Icon}
				renderActions={() => this.renderTitleActions(actions)}
			/>
		);
	}

	public renderTitleActions = (actions) => (
		<Actions>
			{actions.map(({ Button }, index) => (
				<Action key={index}>
					<Button />
				</Action>
			))}
		</Actions>
	)

	public render() {
		const { children, pending } = this.props;

		return (
			<Panel title={this.getTitle()}>
				{this.renderLoader(pending)}
				{this.renderContent(!pending)}
			</Panel>
		);
	}
}
