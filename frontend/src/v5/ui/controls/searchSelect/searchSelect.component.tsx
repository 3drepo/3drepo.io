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

import { formatMessage } from '@/v5/services/intl';
import { NoResults, SearchInput, SearchInputContainer } from '@controls/formSelect/formSearchSelect/formSearchSelect.styles';
import { SearchContext, SearchContextComponent, SearchContextType } from '@controls/search/searchContext';
import { FormControl, InputLabel, Select, FormHelperText, SelectProps, MenuItem } from '@mui/material';
import { ReactNode } from 'react';
import { onlyText } from 'react-children-utilities';
import { FormattedMessage } from 'react-intl';

interface SelectWithLabelProps extends SelectProps {
	required: boolean;
	helperText?: string;
}

export const SelectWithLabel = ({ required = false, helperText, label, ...props }: SelectWithLabelProps) => (
	<FormControl required={required} disabled={props.disabled} error={props.error}>
		<InputLabel id={`${props.name}-label`}>{label}</InputLabel>
		<Select
			{...props}
		/>
		<FormHelperText>{helperText}</FormHelperText>
	</FormControl>
);

export const SearchSelect = ({ children, ...props }: SelectWithLabelProps) => {
	const preventPropagation = (e) => {
		if (e.key !== 'Escape') {
			e.stopPropagation();
		}
	};

	const filter = (items, query: string) => items.filter((node) => onlyText(node).includes(query));

	return (
		<SearchContextComponent filteringFunction={filter} items={children as ReactNode[]}>
			<SearchContext.Consumer>
				{ ({ filteredItems }: SearchContextType<typeof MenuItem>) => (
					<SelectWithLabel {...props}>
						<SearchInputContainer>
							<SearchInput
								placeholder={formatMessage({ id: 'searchSelect.searchInput.placeholder', defaultMessage: 'Search...' })}
								onClick={preventPropagation}
								onKeyDown={preventPropagation}
							/>
						</SearchInputContainer>
						{filteredItems.length && filteredItems}
						{!filteredItems.length && (
							<NoResults>
								<FormattedMessage
									id="form.searchSelect.menuContent.emptyList"
									defaultMessage="No results"
								/>
							</NoResults>
						)}
					</SelectWithLabel>
				)}
			</SearchContext.Consumer>
		</SearchContextComponent>
	);
};
