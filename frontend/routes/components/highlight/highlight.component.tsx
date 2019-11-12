/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import { trim } from 'lodash';
import React, { memo } from 'react';
import Highlighter from 'react-highlight-words';

import { Mark } from './highlight.styles';

interface IProps {
	text: string;
	search: string;
	className?: string;
	splitQueryToWords?: boolean;
	caseSensitive?: boolean;
}

const HighlightTag = (props) => <Mark {...props as any} />;

export const Highlight = memo(({splitQueryToWords, search, text, caseSensitive, className}: IProps) => {
	const searchWords = splitQueryToWords ? search.split(' ') : [trim(search)];
	return (
		<Highlighter
			className={className}
			searchWords={searchWords}
			autoEscape
			textToHighlight={text || ''}
			highlightTag={HighlightTag}
			caseSensitive={caseSensitive}
		/>
	);
});
