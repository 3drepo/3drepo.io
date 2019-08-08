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
	Container,
	Description,
	FileType,
	Property,
	PropertyWrapper,
	Row,
	Tag,
	ToggleButton
} from './revisionsListItem.styles';

interface IProps {
	data: {
		author: string;
		tag?: string;
		timestamp?: string;
		desc?: string;
		void?: boolean;
		fileType?: string;
	};
	current?: boolean;
	editable?: boolean;
	className?: string;
	onClick: (event, revision) => void;
	onSetLatest: (event, revision) => void;
	onToggleVoid: (event, revision) => void;
}

export const RevisionsListItem = (props: IProps) => {
	const { tag, timestamp, desc, author, fileType } = props.data;
	const { current } = props;

	const handleClick = (event) => props.onClick(event, props.data);
	const handleSetLatest = (event) => props.onSetLatest(event, props.data);
	const handleToggleVoid = (event) => props.onToggleVoid(event, props.data);

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
				</PropertyWrapper>
				<Property>
					<DateTime value={timestamp} format={LONG_DATE_TIME_FORMAT} />
				</Property>
			</Row>
			<Row>
				<Property>{author}</Property>
				<ToggleButton
					onClick={handleToggleVoid}
					active={!props.data.void}
				>
					{props.data.void ? 'Void' : 'Active'}
				</ToggleButton>
			</Row>
			<Row>
				<FileType>{fileType || '(unknown type)'}</FileType>
				<ToggleButton
					disabled={props.current}
					active={props.current}
					onClick={handleSetLatest}
				>Current</ToggleButton>
			</Row>
			<Row>
				<Description>{desc || '(no description)'}</Description>
			</Row>
		</Container>
	);
};
