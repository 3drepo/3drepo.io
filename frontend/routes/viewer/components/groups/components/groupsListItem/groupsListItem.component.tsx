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

import IconButton from '@material-ui/core/IconButton';
import Delete from '@material-ui/icons/Delete';
import Bolt from '@material-ui/icons/OfflineBolt';
import { Eye, Tint, HandPaper } from '../../../../../components/fontAwesomeIcon';

import { Info, AuthorWrapper, Actions, Content } from './groupsListItem.styles';
import { MenuItemContainer, Container, RoleIndicator, Description, Name } from './../../../previewListItem/previewListItem.styles';

import { getGroupRGBAColor } from './../../../../../../helpers/colors';
import { DateTime } from '../../../../../components/dateTime/dateTime.component';
import { renderWhenTrue } from '../../../../../../helpers/rendering';

interface IProps {
	autoh: string;
	name: string;
	description: string;
	author: string;
	createdAt: string;
	active?: boolean;
	color: string;
	type: string;
	onItemClick: (event?) => void;
	onArrowClick: (event?) => void;
}

export class GroupsListItem extends React.PureComponent<IProps, any> {

	public get groupTypeIcon() {
		if (this.props.type === 'criteria') {
			return <Bolt />
		}
		return <HandPaper size={'small'} />
	}

	public renderActions = renderWhenTrue((
		<Actions>
			<IconButton onClick={() => console.log('show')}>
				<Eye />
			</IconButton>
			<IconButton onClick={() => console.log('colour')}>
				<Tint />
			</IconButton>
			<IconButton onClick={() => console.log('delete')}>
				<Delete />
			</IconButton>
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
							{this.renderActions(!active)}
							{this.renderDate(active)}
						</Info>
						<Description>
							<Truncate lines={3}>{description}</Truncate>
						</Description>
					</Content>
				</Container>
			</MenuItemContainer>
		);
	}
}
