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
import { PureComponent, type JSX } from 'react';
import { pick } from 'lodash';

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
	<TitleContainer className="panelTitle">
		<Title><TitleIcon>{Icon}</TitleIcon>{title}</Title>
		{renderActions && renderActions()}
	</TitleContainer>
);

interface IProps {
	title: string;
	className?: string;
	Icon?: JSX.Element;
	pending?: boolean;
	flexHeight?: boolean;
	paperProps?: any;
	renderActions?: () => JSX.Element | JSX.Element[];
	id?: string;
	style?: any;
	children: any;
}

export class ViewerPanel extends PureComponent<IProps, any> {
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
		const { pending, className, paperProps, flexHeight, style } = this.props;
		const draggableProps = pick(this.props, ['onMouseDown', 'onMouseUp', 'onTouchStart', 'onTouchEnd']);

		return (
			<Panel
				className={className}
				style={style}
				isPending={pending}
				flexHeight={flexHeight}
				title={this.renderTitle()}
				paperProps={paperProps}
				disableStretching
				id={this.props.id}
				{...draggableProps}
			>
				{this.renderLoader(pending)}
				{this.renderContent(!pending)}
			</Panel>
		);
	}
}
