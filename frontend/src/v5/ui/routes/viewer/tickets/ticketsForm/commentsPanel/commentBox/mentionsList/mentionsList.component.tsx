/**
 *  Copyright (C) 2026 3D Repo Ltd
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

import { List } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { MentionMessage } from '../commentBox.styles';
import { UserCircle } from '@components/shared/popoverCircles/userPopoverCircle/userPopoverCircle.styles';
import { IUser } from '@/v5/store/users/users.redux';
import styled from 'styled-components';

const MentionRow = styled.div<{ $selected: boolean }>`
	width: 100%;
	height: 44px;
	padding: 6px 12px;
	box-sizing: border-box;
	display: flex;
	align-items: center;
	gap: 10px;
	cursor: pointer;
	background-color: ${({ theme, $selected }) => $selected && theme.palette.tertiary.lightest};
`;

const MentionTitles = styled.div`
	min-width: 0;
`;

const MentionTitle = styled.div`
	color: ${({ theme }) => theme.palette.secondary.main};
	font-size: 14px;
	line-height: 16px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`;

const MentionSubtitle = styled.div`
	color: ${({ theme }) => theme.palette.base.main};
	font-size: 12px;
	line-height: 14px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`;

const MAX_VISIBLE_MENTIONS = 4;
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

type MentionUser = IUser & { name: string, id: string };

const createMentionUser = (id: string, name: string, job: string): MentionUser => {
	const [firstName, ...lastNameParts] = name.split(' ');
	return {
		id,
		name,
		user: id,
		firstName,
		lastName: lastNameParts.join(' '),
		job,
		avatarUrl: '',
		hasAvatar: false,
	};
};

export const MENTION_USERS = [
	createMentionUser('1', 'Alice Smith', 'Admin'),
	createMentionUser('2', 'Bob Jones', 'Architect'),
	createMentionUser('3', 'Charlie Brown', 'Main Contractor'),
	createMentionUser('4', 'David Wilson', 'Engineer'),
	createMentionUser('5', 'Sanmont 3D', 'Architect'),
	createMentionUser('6', 'Mosment Taylor', 'Engineer'),
	createMentionUser('7', 'Grace Davis', 'Engineer'),
	createMentionUser('8', 'Hannah Moore', 'Engineer'),
	createMentionUser('9', 'Ian Thomas', 'Engineer'),
	createMentionUser('10', 'Julia Evans', 'Engineer'),
];

const getMatchingMentionItems = (query: string, users: { name: string; id: string }[]) => {
	if (!query) return users;

	// eslint-disable-next-line security/detect-non-literal-regexp
	const matchingRegExp = new RegExp(query.split('').map(escapeRegExp).join('.*'), 'i');

	return users
		.map((item, index) => {
			if (!matchingRegExp.test(item.name)) return null;

			const lowerItem = item.name.toLowerCase();
			const lowerQuery = query.toLowerCase();
			const positions: number[] = [];
			let searchStart = 0;

			lowerQuery.split('').forEach((character) => {
				const position = lowerItem.indexOf(character, searchStart);
				positions.push(position);
				searchStart = position + 1;
			});

			const gaps = positions.slice(1).reduce((total, position, positionIndex) => (
				total + position - positions[positionIndex] - 1
			), 0);

			return {
				item,
				index,
				score: gaps * 100 + positions[0],
			};
		})
		.filter(Boolean)
		.sort((first, second) => first.score - second.score || first.index - second.index)
		.map(({ item }) => item);
};

interface MentionsListComponentProps {
	query: string;
	onMention: ({ name, id }: { name: string; id: string }) => void;
}

export const MentionsListComponent = ({ query, onMention }: MentionsListComponentProps) => {
	const [selectedIndex, setSelectedIndex] = useState(0);
	const visibleItems = useMemo(
		() => getMatchingMentionItems(query, MENTION_USERS).slice(0, MAX_VISIBLE_MENTIONS),
		[query],
	);

	useEffect(() => {
		setSelectedIndex(0);
	}, [query]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (!(event.target instanceof HTMLElement) || !event.target.isContentEditable || !visibleItems.length) return;

			if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
				event.preventDefault();
				const direction = event.key === 'ArrowDown' ? 1 : -1;
				setSelectedIndex((index) => (index + direction + visibleItems.length) % visibleItems.length);
			} else if (event.key === 'Enter') {
				event.preventDefault();
				onMention(visibleItems[selectedIndex]);
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [onMention, selectedIndex, visibleItems]);

	if (!visibleItems.length) return null;

	return (
		<MentionMessage>
			<List disablePadding>
				{visibleItems.map((item, index) => (
					<MentionRow
						key={item.id}
						$selected={selectedIndex === index}
						onMouseEnter={() => setSelectedIndex(index)}
						onMouseDown={(event) => event.preventDefault()}
						onClick={() => onMention(item)}
					>
						<UserCircle user={item} size="small" />
						<MentionTitles>
							<MentionTitle>{item.name}</MentionTitle>
							<MentionSubtitle>{item.job}</MentionSubtitle>
						</MentionTitles>
					</MentionRow>
				))}
			</List>
		</MentionMessage>
	);
};
