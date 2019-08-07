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

import { renderWhenTrue } from '../../../helpers/rendering';
import { LONG_DATE_TIME_FORMAT } from '../../../services/formatting/formatDate';
import { DateTime } from '../dateTime/dateTime.component';
import {
	Button,
	Container,
	Description,
	FileType,
	Property,
	PropertyWrapper,
	Row,
	Tag,
	Toolbar
} from './revisionsListItem.styles';

interface IProps {
	data: {
		author: string;
		tag?: string;
		timestamp?: string;
		desc?: string;
		void?: boolean;
		type?: string;
	};
	current?: boolean;
	editable?: boolean;
	className?: string;
	onClick: (event, revision) => void;
	onSetLatest: (event, revision) => void;
	onToggleVoid: (event, revision) => void;
}

export const RevisionsListItem = (props: IProps) => {
	const { tag, timestamp, desc, author, type } = props.data;
	const { current } = props;

	const handleClick = (event) => props.onClick(event, props.data);
	const handleSetLatest = (event) => props.onSetLatest(event, props.data);
	const handleToggleVoid = (event) => props.onToggleVoid(event, props.data);

	const renderToolbar = renderWhenTrue(() => {
		return (
			<Toolbar>
				<Button onClick={handleSetLatest}>
					Set as {props.data.void ? 'active' : 'void'}
				</Button>
				<Button
					disabled={props.current}
					onClick={handleToggleVoid}
				>
					Set as latest
				</Button>
			</Toolbar>
		);
	});

	return (
		<Container
			onClick={handleClick}
			void={props.data.void}
			current={current}
			divider
		>
			<Row>
				<PropertyWrapper>
					<Tag>{tag || '(no name)'}</Tag>
					<Property>{author}</Property>
				</PropertyWrapper>
				<Property>
					<DateTime value={timestamp} format={LONG_DATE_TIME_FORMAT} />
				</Property>
			</Row>
			<Row>
				<Description>{desc || '(no description)'}</Description>
				<FileType>{type || '(unknown type)'}</FileType>
			</Row>
			{renderToolbar(props.editable)}
		</Container>
	);
};
