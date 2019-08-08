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

import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFileOutlined';
import PersonIcon from '@material-ui/icons/Person';
import React, { useMemo } from 'react';
import { CUSTOM_FILE_EXTS_NAMES } from '../../../constants/revisions';
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
	const handleToggleVoid = (event) => props.onToggleVoid(event, props.data);
	const themeProps = useMemo(() => ({ current, void: props.data.void }), [props.data.void, current]);

	return (
		<Container
			onClick={handleClick}
			theme={themeProps}
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
				<Property>
					<PersonIcon />
					{author}
				</Property>
				<FileType>
					<InsertDriveFileIcon />
					{CUSTOM_FILE_EXTS_NAMES[fileType] || fileType || '(unknown type)'}
				</FileType>
				<ToggleButton onClick={handleToggleVoid} theme={themeProps}>
					{props.data.void ? 'Void' : 'Active'}
				</ToggleButton>
			</Row>
			<Description>{desc || '(no description)'}</Description>
		</Container>
	);
};
