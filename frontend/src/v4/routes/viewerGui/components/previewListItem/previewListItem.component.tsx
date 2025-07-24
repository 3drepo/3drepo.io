/**
 *  Copyright (C) 2020 3D Repo Ltd
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
import removeMd from 'remove-markdown';

import { renderWhenTrue } from '../../../../helpers/rendering';
import { PreviewItemInfo } from '../previewItemInfo/previewItemInfo.component';

import { VIEWER_PANELS } from '../../../../constants/viewerGui';
import { ActionMessage } from '../../../components/actionMessage/actionMessage.component';
import { Truncate } from '../../../components/truncate/truncate.component';
import {
	Actions,
	ArrowButton,
	Container,
	Content,
	Description,
	MenuItemContainer,
	Name,
	OpenInViewerButton,
	RoleIndicator,
	StyledArrowIcon,
	Thumbnail,
	ThumbnailPlaceholder,
	ThumbnailWrapper
} from './previewListItem.styles';

interface IProps {
	className?: string;
	name: string;
	type?: string;
	id?: string;
	teamspace?: string;
	model?: string;
	desc?: string;
	owner?: string;
	created?: number;
	thumbnail: string;
	roleColor: string;
	StatusIconComponent: any;
	statusColor: string;
	due_date?: number;
	number?: number;
	active?: boolean;
	viewpoint?: { guid: string };
	hasViewPermission?: boolean;
	modelLoaded?: boolean;
	hideThumbnail?: boolean;
	willBeRemoved?: boolean;
	panelName?: string;
	extraInfo?: string;
	showModelButton?: boolean;
	onItemClick: (event?) => void;
	onArrowClick: (event?) => void;
	renderActions?: () => JSX.Element[];
	willBeClosed?: boolean;
	panelType?: string;
}

export class PreviewListItem extends PureComponent<IProps, any> {
	get isExpiredDate() {
		const { due_date } = this.props;
		return Number(!!(due_date && new Date().valueOf() >= due_date));
	}

	public renderArrowButton = renderWhenTrue(() => (
		<ArrowButton onClick={this.props.onArrowClick} disabled={!this.props.modelLoaded}>
			<StyledArrowIcon />
		</ArrowButton>
	));

	public renderNameWithCounter = renderWhenTrue(() => (
		<Name as="div" onClick={this.props.onArrowClick}>
			<Truncate lines={1}>
				{`${this.props.number} ${this.props.name}`}
			</Truncate>
		</Name>
	));

	public renderName = renderWhenTrue(() => (
		<Name as="div" onClick={this.props.onArrowClick}>
			<Truncate lines={1}>
				{this.props.name}
			</Truncate>
		</Name>
	));

	public renderClosedMessage = renderWhenTrue(() =>
		<ActionMessage content={`This ${(this.props.panelName || 'item').slice(0, -1)} is now closed`} />);

	public renderThumbnail = renderWhenTrue(() => (
		<ThumbnailWrapper>
			{this.props.thumbnail ?
				<Thumbnail src={`${this.props.thumbnail}?${this.props.viewpoint.guid}`} /> :
				<ThumbnailPlaceholder>No image</ThumbnailPlaceholder>
			}
		</ThumbnailWrapper>
	));

	public renderActions = renderWhenTrue(() => (
		<Actions>
			{this.props.renderActions()}
		</Actions>
	));

	public renderDeleteMessage = renderWhenTrue(() =>
		<ActionMessage content={`This ${this.props.panelName || 'item'} has been deleted`} />
	);

	public renderViewModel = renderWhenTrue(() => {
		const { type, id, teamspace, model } = this.props;
		return (
			<OpenInViewerButton
				teamspace={teamspace}
				model={model}
				query={`${type === 'issues' ? 'issueId' : 'riskId'}=${id}`}
			/>
		);
	});

	public render() {
		const {
			roleColor,
			number,
			owner,
			hideThumbnail,
			StatusIconComponent,
			statusColor,
			onItemClick,
			active,
			hasViewPermission,
			className,
			renderActions,
			willBeRemoved,
			willBeClosed,
			showModelButton,
			panelType,
		} = this.props;

		const desc = removeMd(this.props.desc);
		const shouldRenderActions = renderActions && active;
		const createdDate = !shouldRenderActions ? this.props.created : '';
		const extraInfo = panelType === VIEWER_PANELS.GROUPS || !shouldRenderActions ? this.props.extraInfo : '';

		return (
			<MenuItemContainer
				className={className}
				expired={this.isExpiredDate}
				onClick={onItemClick}
				disabled={willBeRemoved}
			>
				{this.renderDeleteMessage(willBeRemoved)}
				<Container>
					{this.renderClosedMessage(willBeClosed)}
					<RoleIndicator color={roleColor} />
					{this.renderThumbnail(!hideThumbnail)}
					<Content>
						{this.renderNameWithCounter(number)}
						{this.renderName(!(number))}
						{this.renderViewModel(showModelButton)}

						<PreviewItemInfo
							author={owner}
							StatusIconComponent={StatusIconComponent}
							statusColor={statusColor}
							createdAt={createdDate}
							extraInfo={extraInfo}
							panelType={panelType}
						/>
						<Description>
							<Truncate lines={3}>{desc || '(no description)'}</Truncate>
						</Description>
						{this.renderActions(renderActions && active || panelType === VIEWER_PANELS.GROUPS)}
					</Content>
				</Container>
				{this.renderArrowButton(active && hasViewPermission)}
			</MenuItemContainer>
		);
	}
}
