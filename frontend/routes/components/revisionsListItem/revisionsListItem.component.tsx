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
import LinkIcon from '@material-ui/icons/Link';
import PersonIcon from '@material-ui/icons/Person';
import React, { useMemo } from 'react';

import { CUSTOM_FILE_EXTS_NAMES } from '../../../constants/revisions';
import { renderWhenTrue } from '../../../helpers/rendering';
import { LONG_DATE_TIME_FORMAT } from '../../../services/formatting/formatDate';
import { DateTime } from '../dateTime/dateTime.component';
import { Loader } from '../loader/loader.component';
import { SmallIconButton } from '../smallIconButon/smallIconButton.component';
import {
	Container,
	Description,
	FileType,
	LinkWrapper,
	LoaderContainer,
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
	isPending?: boolean;
	onClick: (event, revision) => void;
	onSetLatest: (event, revision) => void;
	onToggleVoid: (event, revision) => void;
}

const renderLoader = renderWhenTrue(<LoaderContainer><Loader /></LoaderContainer>);

export const RevisionsListItem = (props: IProps) => {
	const { tag, timestamp, desc, author, fileType } = props.data;
	const { current, isPending } = props;

	const handleClick = (event) => props.onClick(event, props.data);
	const handleToggleVoid = (event) => props.onToggleVoid(event, props.data);
	const themeProps = useMemo(() =>
		({ current, void: props.data.void, isPending }), [isPending, props.data.void, current]
	);

	const renderGoToRevisionButton = renderWhenTrue(
		<LinkWrapper>
			<SmallIconButton Icon={LinkIcon} tooltip={'Go to revision'} onClick={handleClick} tooltipPlacement={'right'} />
		</LinkWrapper>
	);

	const renderToggleButton = renderWhenTrue(
		<ToggleButton onClick={handleToggleVoid} theme={themeProps}>
			{props.data.void ? 'Void' : 'Active'}
		</ToggleButton>
	);

	return (
		<Container
			theme={themeProps}
			divider
		>
			{renderLoader(isPending)}
			<Row>
				<PropertyWrapper>
					<Tag>{tag || '(no name)'} {renderGoToRevisionButton(!props.data.void)}</Tag>
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
				{renderToggleButton(props.editable)}
			</Row>
			<Row>
				<Description>{desc || '(no description)'}</Description>
			</Row>
		</Container>
	);
};
