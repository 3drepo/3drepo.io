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
import { isEqual, xorWith } from 'lodash';
import { Children, cloneElement, ReactElement, useContext, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { SearchInput, NoResults } from './formMultiSelect.styles';
import { MultiSelectMenuItem } from './multiSelectMenuItem/multiSelectMenuItem.component';

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
				id="form.multiSelect.search.emptyList"
				defaultMessage="No results"
			/>
		</NoResults>
	);
};

export type FormMultiSelectProps = FormSelectProps & { children: JSX.Element | JSX.Element[] }

export const FormMultiSelect = ({ children: rawChildren, control, label, name, ...props }: FormMultiSelectProps) => {
	const [selectedItems, setSelectedItems] = useState([]);
	const [items, setItems] = useState([]);

	const toggleItemSelection = (item) => {
		setSelectedItems((items) => xorWith(items, [item], isEqual));
	};

	const itemIsSelected = (itemName) => !!selectedItems.find(({ name }) => name === itemName);

	const preventInputUnfocus = (e) => {
		if (e.key !== 'Escape') e.stopPropagation();
	};

	const verifyChildrenAreValid = () => {
		Children.forEach(rawChildren, (child) => {
			if (child.type !== MultiSelectMenuItem) {
				throw new Error('FormMultiSelect only accepts an array of MultiSelectMenuItem as direct children');
			}
		});
	};

	const populateChildren = () => {
		setItems(
			Children.toArray(rawChildren)
				.map((child: ReactElement) => (
					cloneElement(child, { toggleItemSelection, itemIsSelected })
				))
		);
	};

	useEffect(() => {
		verifyChildrenAreValid();
		populateChildren();
	}, [rawChildren]);

	// necessary because cloneElement does not keep track of
	// changes in the props passed to the children which do not have
	// the latest values for selectedItems
	useEffect(() => { populateChildren(); }, [selectedItems]);

	return (
		<SearchContextComponent fieldsToFilter={['props.label']} items={items}>
			<FormSelect
				multiple
				defaultValue={[]}
				control={control}
				name={name}
				renderValue={() => selectedItems.map(({ label }) => label).join(', ')}
				value={selectedItems.map(({ value }) => value)}
				{...props}
			>
				<SearchInput
					placeholder={formatMessage({ id: 'form.multiSelect.search.placeholder', defaultMessage: 'Search...' })}
					onKeyDown={preventInputUnfocus}
				/>
				<MenuContent />
			</FormSelect>
		</SearchContextComponent>
	);
};
