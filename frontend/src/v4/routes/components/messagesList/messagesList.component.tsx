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
import { useRef, useLayoutEffect, useState, useMemo } from 'react';
import MenuItem from '@mui/material/MenuItem';
import { SelectChangeEvent } from '@mui/material';
import { cond, matches, stubTrue } from 'lodash';

import { renderWhenTrue, renderWhenTrueOtherwise } from '../../../helpers/rendering';
import { EmptyStateInfo } from '../components.styles';
import { Loader as LoaderIndicator } from '../loader/loader.component';
import { Message } from './components/message/message.component';
import { Container, FilterWrapper, FormContainer, Label, LoaderContainer, Select } from './messagesList.styles';

interface IProps {
	className?: string;
	formRef?: any;
	commentRef?: any;
	messages: any[];
	isPending: boolean;
	currentUser: string;
	teamspace: string;
	removeMessage: (index, guid) => void;
	setCameraOnViewpoint: (viewpoint) => void;
}

const EmptyState = ({ filter }) => (
	<EmptyStateInfo>
		No {cond([
			[matches('comments'), () => 'comments'],
			[matches('systemLogs'), () => 'system logs'],
			[stubTrue, () => 'messages']
		])(filter)}
	</EmptyStateInfo>
);

const Loader = () => (
	<LoaderContainer>
		<LoaderIndicator size={18} />
	</LoaderContainer>
);

const maxScrollTop = (element) => element.scrollHeight - element.clientHeight;

export const MessagesList = ({ teamspace, isPending, messages, ...props }: IProps) => {
	const [filter, setFilter] = useState('comments');
	const listRef = useRef<HTMLDivElement>(undefined);

	useLayoutEffect(() => {
		if (listRef.current) {
			const list = listRef.current;
			const currentScroll = Math.ceil(list.scrollTop);
			const isScrolled = currentScroll >= maxScrollTop(list);

			if (!isScrolled) {
				list.scrollTo({
					top: list.scrollHeight - list.clientHeight,
					behavior: 'smooth'
				});
			}
		}
	}, [isPending, messages.length, filter]);

	const messagesList = useMemo(() => messages
		.filter((message) => cond([
			[matches('comments'), () => !Boolean(message.action)],
			[matches('systemLogs'), () => Boolean(message.action)],
			[stubTrue, stubTrue]
		])(filter))
		.map((item, index) => (
			<Message
				key={`${item.guid}_${item._id}`}
				index={index}
				{...item}
				formRef={props.formRef}
				commentRef={props.commentRef}
				removeMessage={props.removeMessage}
				teamspace={teamspace}
				currentUser={props.currentUser}
				setCameraOnViewpoint={props.setCameraOnViewpoint}
			/>
		)).reverse()
	, [messages, filter]);

	const handleChange = (event: SelectChangeEvent<{ value: unknown }>) => {
		setFilter(event.target.value as string);
	};

	return (
		<>
			<FilterWrapper>
				<FormContainer>
					<Label paragraph>
						Show:
					</Label>
					<Select
						id="messages-filter"
						value={filter}
						onChange={handleChange}
					>
						<MenuItem value="comments">Comments</MenuItem>
						<MenuItem value="systemLogs">System logs</MenuItem>
						<MenuItem value="all">All</MenuItem>
					</Select>
				</FormContainer>
			</FilterWrapper>
			<Container className={props.className} ref={listRef}>
				{renderWhenTrueOtherwise(
					<Loader />,
					<>
						{messagesList}
					</>,
				)(isPending)}
				{renderWhenTrue(
					<EmptyState filter={filter} />
				)(!isPending && (!messagesList.length))}
			</Container>
		</>
	);
};
