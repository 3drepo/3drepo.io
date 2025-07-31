/**
 *  Copyright (C) 2022 3D Repo Ltd
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

import { SearchContext, SearchContextComponent, SearchContextType } from '@controls/search/searchContext';
import { Select, SelectProps } from '@controls/inputs/select/select.component';
import { MenuItem } from '@mui/material';
import { ReactNode } from 'react';
import { onlyText } from 'react-children-utilities';
import { FormattedMessage } from 'react-intl';
import { SearchInputContainer, SearchInput, NoResults } from './searchSelect.styles';

export const SearchSelect = ({ children, ...props }: SelectProps) => {
	const preventPropagation = (e) => {
		if (e.key !== 'Escape') {
			e.stopPropagation();
		}
	};

	const filterItems = (items, query: string) => {
		if (!query.length) return items;
		return items
			.filter((node) => onlyText(node).toLowerCase()
				.includes(query.toLowerCase()));
	};

	return (
		<SearchContextComponent filteringFunction={filterItems} items={children as ReactNode[]}>
			<SearchContext.Consumer>
				{ ({ filteredItems }: SearchContextType<typeof MenuItem>) => (
					<Select
						{...props}
						MenuProps={{
							disableAutoFocusItem: true,
							PaperProps: {
								style: { maxHeight: 231 },
							},
						}}
					>
						<SearchInputContainer>
							<SearchInput
								onClick={preventPropagation}
								onKeyDown={preventPropagation}
							/>
						</SearchInputContainer>
						{(filteredItems.length > 0 && filteredItems) as any}
						{!filteredItems.length && (
							<NoResults>
								<FormattedMessage
									id="form.searchSelect.menuContent.emptyList"
									defaultMessage="No results"
								/>
							</NoResults>
						)}
					</Select>
				)}
			</SearchContext.Consumer>
		</SearchContextComponent>
	);
};
