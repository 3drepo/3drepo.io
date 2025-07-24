/**
 *  Copyright (C) 2021 3D Repo Ltd
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
import { isArray, trim } from 'lodash';
import Highlighter from 'react-highlight-words';
import { Tag } from './highlight.styles';

import type { JSX } from "react";

interface IHighlight {
	children: string;
	search: string | string[];
}

const HighlightTag = (props) => <Tag {...props} />;

export const Highlight = ({ search, children = '' }: IHighlight): JSX.Element => (
	<Highlighter
		searchWords={isArray(search) ? search.map(trim) : [trim(search)]}
		autoEscape
		textToHighlight={children}
		highlightTag={HighlightTag}
	/>
);
