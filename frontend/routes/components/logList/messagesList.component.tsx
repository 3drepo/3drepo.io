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

import React from 'react';

import { cond, matches, stubTrue } from 'lodash';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

import { renderWhenTrue, renderWhenTrueOtherwise } from '../../../helpers/rendering';
import {useStayScrolled} from '../../../hooks/useStayScrolled';
import * as API from '../../../services/api';
import { Loader as LoaderIndicator } from '../loader/loader.component';
import { Message } from './components/message/message.component';
import { Container, EmptyStateInfo, FilterWrapper, FormContainer, Label, LoaderContainer } from './logList.styles';

interface IProps {
	className?: string;
	// commentsRef?: any;
	messages: any[];
	isPending: boolean;
	currentUser: string;
	teamspace: string;
	removeMessage: (index, guid) => void;
	setCameraOnViewpoint: (viewpoint) => void;
}

const EmptyState = () => (
	<EmptyStateInfo>
		No comments
	</EmptyStateInfo>
);

const Loader = () => (
	<LoaderContainer>
		<LoaderIndicator size={18} />
	</LoaderContainer>
);

export const MessagesList = ({ teamspace, isPending, messages, ...props }: IProps) => {
	const [users, setUsers] = React.useState([]);
	const [filter, setFilter] = React.useState('all');
	const listRef = React.useRef<HTMLDivElement>();

	React.useEffect(() => {
		(async () => {
			const { data } = await API.fetchUsers(teamspace);
			setUsers(data);
		})();
	}, []);

	React.useLayoutEffect(() => {
		if (listRef.current) {
			const list = listRef.current;
			const lastMessage = list.lastChild as any;
			const lastMessageHeight = lastMessage.offsetHeight;

			// @TODO do not scroll if user is in a middle of list

			const maxScrollTop = (element) => element.scrollHeight - element.clientHeight;
			const isScrolled = Math.ceil(list.scrollTop) >= maxScrollTop(list);

			if (!isScrolled) {
				list.scrollTop = list.scrollHeight - list.clientHeight;
			}
		}
	}, [isPending, messages.length]);

	const messagesList = React.useMemo(() => messages
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
								removeMessage={props.removeMessage}
								users={users}
								teamspace={teamspace}
								currentUser={props.currentUser}
								setCameraOnViewpoint={props.setCameraOnViewpoint}
						/>
				)).reverse()
	, [messages, users, filter]);

	const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
		setFilter(event.target.value as string);
	};

	// @TODO move filtering to redux state and filter form to separate component

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
					<EmptyState />
				)(!isPending && !messages.length)}
			</Container>
		</>
	);
};
