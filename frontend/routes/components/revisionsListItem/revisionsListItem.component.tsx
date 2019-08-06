/**
 *  Copyright (C) 2019 3D Repo Ltd
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

import {
	ActionsMenuWrapper,
	Column,
	Container,
	Description,
	Property,
	PropertyWrapper,
	Row,
	Tag
} from './revisionsListItem.styles';

import { LONG_DATE_TIME_FORMAT } from '../../../services/formatting/formatDate';
import { ButtonMenu } from '../buttonMenu/buttonMenu.component';
import { DateTime } from '../dateTime/dateTime.component';
import { MenuButton } from '../menuButton/menuButton.component';

interface IProps {
	data: {
		author: string;
		tag?: string;
		timestamp?: string;
		desc?: string;
		void?: boolean;
	};
	current?: boolean;
	editable?: boolean;
	className?: string;
	onClick: (event, revision) => void;
	onSetLatest: (event, revision) => void;
	onToggleVoid: (event, revision) => void;
}

const menuStyles = {
	overflow: 'initial',
	boxShadow: 'none'
};

export const RevisionsListItem = (props: IProps) => {
	const { tag, timestamp, desc, author } = props.data;
	const { current } = props;

	const handleClick = (event) => props.onClick(event, props.data);

	return (
		<Container
			onClick={handleClick}
			void={props.data.void}
			current={current}
			divider
		>
			<Row>
				<PropertyWrapper>
					<Tag>{tag || '(no tag)'}</Tag>
					<Property active={current}>{props.current && '(current revision)'}</Property>
				</PropertyWrapper>
				<Property active={current}>
					<DateTime value={timestamp} format={LONG_DATE_TIME_FORMAT} />
				</Property>

				{props.editable &&
					<ActionsMenuWrapper>
						<ButtonMenu
							renderButton={MenuButton}
							renderContent={(menu) => this.renderActionsMenu(menu, revision)}
							PaperProps={{ style: menuStyles }}
							PopoverProps={{ anchorOrigin: { vertical: 'center', horizontal: 'left' } }}
							ButtonProps={{ disabled: false }}
						/>
					</ActionsMenuWrapper>
				}
			</Row>
			<Column>
				<Property active={current}>{author}</Property>
				<Description>{desc || '(no description)'}</Description>
			</Column>
		</Container>
	);
};
