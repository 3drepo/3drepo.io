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
import { FormSelect, FormSelectProps } from '@controls/formSelect/formSelect.component';
import { ScrollArea } from '@controls/scrollArea';
import { SearchContext, SearchContextComponent } from '@controls/search/searchContext';
import { Children, cloneElement, ReactElement, useContext, useEffect, useRef, useState } from 'react';
import { onlyText } from 'react-children-utilities';
import { FormattedMessage } from 'react-intl';
import { SearchInput, NoResults, RenderValueTrigger, SearchInputContainer } from './formSearchSelect.styles';

const MenuContent = () => {
	const { filteredItems } = useContext(SearchContext);

	if (filteredItems.length > 0) {
		return (
			<ScrollArea autoHeight>
				{filteredItems}
			</ScrollArea>
		);
	}

	return (
		<NoResults>
			<FormattedMessage
				id="form.searchSelect.menuContent.emptyList"
				defaultMessage="No results"
			/>
		</NoResults>
	);
};

export type SearchItem = {
	value: any,
	children: JSX.Element | JSX.Element[],
};

export type FormSearchSelectProps = FormSelectProps & {
	onItemClick: (item: SearchItem) => void;
	itemIsSelected: (item: SearchItem) => void;
};

export const FormSearchSelect = ({
	children: rawChildren,
	onItemClick,
	itemIsSelected,
	value,
	...props
}: FormSearchSelectProps) => {
	const renderValueRef = useRef<HTMLLIElement & { selected }>();
	const [items, setItems] = useState([]);
	const SEARCH_VALUE_PROP = 'searchvalue';

	const preventInputUnfocus = (e) => {
		if (e.key !== 'Escape') {
			e.stopPropagation();
		}
	};

	const populateChildren = () => {
		setItems(
			Children.toArray(rawChildren)
				.map((child: ReactElement) => {
					const { children, value: childValue } = child.props;
					return (
						cloneElement(child, {
							onClick: () => onItemClick({ children, value: childValue }),
							selected: itemIsSelected({ children, value: childValue }),
							[SEARCH_VALUE_PROP]: onlyText(children),
						})
					);
				}),
		);
	};

	useEffect(() => { populateChildren(); }, [rawChildren, itemIsSelected]);

	useEffect(() => {
		if (!renderValueRef.current?.selected) {
			renderValueRef.current?.click();
		}
	}, [value]);

	return (
		<SearchContextComponent fieldsToFilter={[`props.${SEARCH_VALUE_PROP}`]} items={items}>
			<FormSelect value={value} {...props}>
				<SearchInputContainer>
					<SearchInput
						placeholder={formatMessage({ id: 'form.searchSelect.searchInput.placeholder', defaultMessage: 'Search...' })}
						onClick={preventInputUnfocus}
					/>
				</SearchInputContainer>
				<RenderValueTrigger ref={renderValueRef} key={RenderValueTrigger} />
				<MenuContent />
			</FormSelect>
		</SearchContextComponent>
	);
};
