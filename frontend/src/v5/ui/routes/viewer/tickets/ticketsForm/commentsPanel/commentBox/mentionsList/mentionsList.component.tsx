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

import { List, ListItemButton, ListItemText } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { MentionMessage } from '../commentBox.styles';

const MAX_VISIBLE_MENTIONS = 4;
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getMatchingMentionItems = (query: string, users: string[]) => {
	if (!query) return users;

	// eslint-disable-next-line security/detect-non-literal-regexp
	const matchingRegExp = new RegExp(query.split('').map(escapeRegExp).join('.*'), 'i');

	return users
		.map((item, index) => {
			if (!matchingRegExp.test(item)) return null;

			const lowerItem = item.toLowerCase();
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
	onMention: (mention: string) => void;
}

export const MentionsListComponent = ({ query, onMention }: MentionsListComponentProps) => {
	const users = ['Alice', 'Bob', 'Charlie', 'David', 'sanmont3d', 'mosment', 'Grace', 'Hannah', 'Ian', 'Julia'];


	const [selectedIndex, setSelectedIndex] = useState(0);
	const visibleItems = useMemo(
		() => getMatchingMentionItems(query, users).slice(0, MAX_VISIBLE_MENTIONS),
		[query],
	);

	useEffect(() => {
		setSelectedIndex(0);
	}, [query]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (!(event.target instanceof HTMLTextAreaElement) || !visibleItems.length) return;

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
					<ListItemButton
						key={item}
						dense
						selected={selectedIndex === index}
						onMouseDown={(event) => event.preventDefault()}
						onClick={() => onMention(item)}
					>
						<ListItemText primary={item} />
					</ListItemButton>
				))}
			</List>
		</MentionMessage>
	);
};
