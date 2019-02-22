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

import { Info, AuthorWrapper, Actions, Content } from './groupsListItem.styles';
import { 
	MenuItemContainer, Container, RoleIndicator, Description, Name, ArrowButton, StyledArrowIcon 
} from './../../../previewListItem/previewListItem.styles';

import { getGroupRGBAColor } from './../../../../../../helpers/colors';
import { DateTime } from '../../../../../components/dateTime/dateTime.component';
import { renderWhenTrue } from '../../../../../../helpers/rendering';
import { TooltipButton } from '../../../../../teamspaces/components/tooltipButton/tooltipButton.component';

interface IProps {
	autoh: string;
	name: string;
	description: string;
	author: string;
	createdAt: string;
	active?: boolean;
	color: string;
	type: string;
	modelLoaded: boolean;
	onItemClick: (event?) => void;
	onArrowClick: (event?) => void;
}

const EyeIcon = () => <Eye size="xs" />;
const TintIcon = () => <Tint size="xs" />;

export class GroupsListItem extends React.PureComponent<IProps, any> {
	public get groupTypeIcon() {
		if (this.props.type === 'criteria') {
			return <Bolt />
		}
		return <HandPaper size="xs" />
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
				action={() => console.log('isolate')}
				Icon={EyeIcon}
				disabled={!this.props.modelLoaded}
			/>
			<TooltipButton
				label="Toggle Colour Override"
				action={() => console.log('toggle colour')}
				Icon={TintIcon}
				disabled={!this.props.modelLoaded}
			/>
			<TooltipButton
				label="Delete"
				action={() => console.log('Delete')}
				Icon={Delete}
				disabled={!this.props.modelLoaded}
			/>
		</Actions>
	))

	public renderDate = renderWhenTrue((
		<DateTime value={this.props.createdAt} format="HH:mm DD MMM" />
	))

	public render() {
		const { author, active, description, name, color, onItemClick } = this.props;
		console.log('List item', this.props);
		return (
			<MenuItemContainer onClick={onItemClick}>
				<Container>
					<RoleIndicator color={getGroupRGBAColor(color)} width={`10px`} />
					<Content>
						<Name>{name}</Name>
						<Info>
							<AuthorWrapper>
								{this.groupTypeIcon}
								{author}
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
