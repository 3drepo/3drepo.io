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

import { renderWhenTrue } from '../../../../helpers/rendering';
import { Loader } from '../../../components/loader/loader.component';
import {
	Actions,
	LoaderContainer,
	Panel,
	Title,
	TitleContainer,
	TitleIcon
} from './viewerPanel.styles';

const ViewerPanelTitle = ({title, Icon, renderActions}) => (
	<TitleContainer>
		<Title><TitleIcon>{Icon}</TitleIcon>{title}</Title>
		{renderActions && renderActions()}
	</TitleContainer>
);

interface IProps {
	title: string;
	className?: string;
	Icon?: JSX.Element;
	pending?: boolean;
	paperProps?: any;
	renderActions?: () => JSX.Element | JSX.Element[];
}

export class ViewerPanel extends React.PureComponent<IProps, any> {
	public renderContent = renderWhenTrue(() => (
		<>{this.props.children}</>
	));

	public renderLoader = renderWhenTrue(() => (
		<LoaderContainer>
			<Loader />
		</LoaderContainer>
	));

	public renderTitleActions = () => renderWhenTrue(() => (
		<Actions>
		{this.props.renderActions()}
		</Actions>
	))(this.props.renderActions)

	public renderTitle = () => (
		<ViewerPanelTitle
			title={this.props.title}
			Icon={this.props.Icon}
			renderActions={this.renderTitleActions}
		/>
	)

	public render() {
		const { pending, className, paperProps } = this.props;

		return (
			<Panel
				className={className}
				isPending={pending}
				title={this.renderTitle()}
				paperProps={paperProps}
			>
				{this.renderLoader(pending)}
				{this.renderContent(!pending)}
			</Panel>
		);
	}
}
