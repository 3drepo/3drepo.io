/**
 *  Copyright (C) 2025 3D Repo Ltd
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

import { SearchContext } from '@controls/search/searchContext';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const ellipsisLimits = (length) => {
	const lenghtWithoutEllipsis = length - 5; // (...) + 2 characters for padding
	const max = Math.round((2 / 3) * lenghtWithoutEllipsis);
	const min = lenghtWithoutEllipsis - max;
	return { max, min };
};

const middleEllipsis = (str: string, maxLength: number ) => {
	if (str.length <= maxLength) {
		return str;
	}

	const { max, min } = ellipsisLimits(maxLength);
	return str.substring(0, max) + '...' + str.substring(str.length - min, str.length);
};

const cutQuery = (query: string, str: string, maxLength: number) =>{
	if (str.length <= maxLength) {
		return query;
	}

	const querySet = new Set([query]);
	const splitted = str.toLowerCase().split(query.toLowerCase());
	const { max, min } = ellipsisLimits(maxLength);
	const rightCuttoffIndex = str.length - min; 
	
	let index = 0;

	for (let i = 0; i < splitted.length; i++) {
		index += splitted[i].length;

		// If the match crosses the dots but dosn't reach the right cuttoff end staring before the dots 
		// for example: text with "orange apple grape" with max 8 and min 3 ("orange a...ape")
		// with query "apple" the match will be cut off to "a..."
		if (index < max && index + query.length > max && index < rightCuttoffIndex) {
			querySet.add(query.substring(0, max - index) + '...');
		}

		// If the match crosses the dots but dosn't reach the right cuttoff end 
		// for example: text with "orange apple grape" with max 8 and min 3 ("orange a...ape")
		// with query "grape" the match will be cut off to "...ape"
		// with query "pple" the match will be converted to just "..."
		if (index >= max && index < rightCuttoffIndex) {
			querySet.add('...' + query.substring(Math.min(rightCuttoffIndex - index, query.length)));
		}

		// If the match crosses the dots starting before the dots and passing the right cuttoff end 
		// for example: text with "orange apple grape" with max 8 and min 3 ("orange a...ape")
		// with query "apple grap" the match will be cut off to "a...ap"
		if (index < max && index + query.length > rightCuttoffIndex) {
			querySet.add(query.substring(0, max - index) + '...' + query.substring(rightCuttoffIndex - index));
		}

		index += query.length;
	}

	return Array.from(querySet);
};

export interface MiddleEllipsisContextType {
	text?: string;
	searchText?: string | string[];
}

export const MiddleEllipsisContext = createContext<MiddleEllipsisContextType>({});
MiddleEllipsisContext.displayName = 'MiddleEllipsisContext';

type MiddleEllipsisProps = {
	children: React.ReactNode;
	text?: string;
	style?: React.CSSProperties;
};

export const MiddleEllipsis = ({ children, text, style }: MiddleEllipsisProps) => {
	const [contextValue, setContextValue] = useState<MiddleEllipsisContextType>({ text });
	const { query } = useContext(SearchContext);
	const [characterSize, setCharacterSize] = useState(-1);
	
	const containerRef = useRef<HTMLDivElement>(null);

	const prepEllipse = useCallback(() => {
		if (characterSize === -1 || !containerRef.current ) return;
		const maxCharacters = Math.floor(containerRef.current.offsetWidth / characterSize);
		
		if (maxCharacters > text.length) {
			if (contextValue.text === text && contextValue.searchText === query) return;
			setContextValue({ text, searchText: query });
			return;
		}
	
		const newText = middleEllipsis(text, maxCharacters);
		let searchText: string | string[] = query;
		if (query) {
			searchText = cutQuery(query, text, maxCharacters);
		}

		setContextValue({ text: newText, searchText  });
	}, [characterSize, query, text]);
		
	useEffect(() => {
		window.addEventListener('resize', prepEllipse);
		prepEllipse();

		return () => {
			window.removeEventListener('resize', prepEllipse);
		};
	}, [prepEllipse]);

	
	useEffect(() => {
		if (!text || !containerRef.current) return;
		const txtNode: any = containerRef.current.querySelector('[data-ellipsis-text]') || containerRef.current;
		const textWidth = txtNode.offsetWidth;
		const charSize = textWidth / text.length;
		setCharacterSize(charSize);
	}, [text]);

	return (
		<MiddleEllipsisContext.Provider value={contextValue}>
			<div
				ref={containerRef}
				style={{
					wordBreak: 'keep-all',
					overflowWrap: 'normal',
					overflow: 'hidden',
					textOverflow: 'initial',
					...(style || {}),
				}}
			>
				{children}
			</div>
		</MiddleEllipsisContext.Provider>
	);
};