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
import Truncate from 'react-truncate';

import Delete from '@material-ui/icons/Delete';
import Bolt from '@material-ui/icons/OfflineBolt';
import { Eye, Tint, HandPaper } from '../../../../../components/fontAwesomeIcon';

import {
	Info,
	AuthorWrapper,
	Actions,
	Content,
	MenuItemContainer,
	StyledIcon
} from './groupsListItem.styles';
import {
	Container, RoleIndicator, Description, Name, ArrowButton, StyledArrowIcon
} from './../../../previewListItem/previewListItem.styles';
import { Author } from './../../../previewItemInfo/previewItemInfo.styles';

import { getGroupRGBAColor } from './../../../../../../helpers/colors';
import { DEFAULT_OVERRIDE_COLOR, GROUPS_TYPES } from './../../../../../../constants/groups';
import { DateTime } from '../../../../../components/dateTime/dateTime.component';
import { renderWhenTrue } from '../../../../../../helpers/rendering';
import { TooltipButton } from '../../../../../teamspaces/components/tooltipButton/tooltipButton.component';

interface IProps {
	_id: string;
	name: string;
	description: string;
	author: string;
	createdAt: string;
	active?: boolean;
	color: any[];
	type: string;
	modelLoaded: boolean;
	highlighted: boolean;
	overrided: boolean;
	onItemClick: (event?) => void;
	onArrowClick: (event?) => void;
	toggleColorOverride: () => void;
	deleteGroup: (groupId) => void;
	isolateGroup: () => void;
}

const EyeIcon = () => <StyledIcon><Eye /></StyledIcon>;

export class GroupsListItem extends React.PureComponent<IProps, any> {
	public get groupTypeIcon() {
		if (this.props.type === GROUPS_TYPES.SMART) {
			return <Bolt />;
		}
		return <HandPaper fontSize="inherit" />;
	}

	public getTintIcon = () => (
		<StyledIcon color={this.getOverridedColor()}>
			<Tint fontSize="inherit" />
		</StyledIcon>
	)
	public getOverridedColor = () => {
		if (this.props.overrided) {
			return getGroupRGBAColor(this.props.color);
		}
		return DEFAULT_OVERRIDE_COLOR;
	}

	public renderArrowButton = renderWhenTrue(() => (
		<ArrowButton onClick={this.props.onArrowClick} disabled={!this.props.modelLoaded}>
			<StyledArrowIcon />
		</ArrowButton>
	));

	public renderActions = renderWhenTrue((
		<Actions>
			<TooltipButton
				label="Isolate"
				action={this.props.isolateGroup}
				Icon={EyeIcon}
				disabled={!this.props.modelLoaded}
			/>
			<TooltipButton
				label="Toggle Colour Override"
				action={this.props.toggleColorOverride}
				Icon={() => this.getTintIcon()}
				disabled={!this.props.modelLoaded}
			/>
			<TooltipButton
				label="Delete"
				action={() => this.props.deleteGroup(this.props._id)}
				Icon={Delete}
				disabled={!this.props.modelLoaded}
			/>
		</Actions>
	));

	public renderDate = renderWhenTrue((
		<DateTime value={this.props.createdAt} format="HH:mm DD MMM" />
	));

	public render() {
		const { author, active, description, name, color, onItemClick, highlighted } = this.props;
		return (
			<MenuItemContainer onClick={onItemClick} highlighted={highlighted ? 1 : 0}>
				<Container>
					<RoleIndicator color={getGroupRGBAColor(color)} />
					<Content>
						<Name>{name}</Name>
						<Info>
							<AuthorWrapper>
								<StyledIcon>
									{this.groupTypeIcon}
								</StyledIcon>
								<Author>{author}</Author>
							</AuthorWrapper>
							{this.renderActions(active)}
							{this.renderDate(!active)}
						</Info>
						<Description>
							<Truncate lines={3}>{description}</Truncate>
						</Description>
					</Content>
				</Container>
				{this.renderArrowButton(active)}
			</MenuItemContainer>
		);
	}
}
