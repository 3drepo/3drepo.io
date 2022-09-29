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
import { Children, cloneElement, ReactElement, useContext, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { SearchInput, NoResults } from './formMultiSelect.styles';
import { MultiSelectMenuItem } from './multiSelectMenuItem/multiSelectMenuItem.component';

export type LabelAndValue = {
	label: string;
	value: any;
}

type ContextualisedMultiSelectProps = FormSelectProps & {
	setItems: (items) => void;
}

const ContextualisedMultiSelect = ({ children: rawChildren, setItems, control, name, ...props }: ContextualisedMultiSelectProps) => {
	const [selectedItems, setSelectedItems] = useState(new Set<LabelAndValue>());
	const { filteredItems } = useContext(SearchContext);

	const toggleSelectedItem = (value: LabelAndValue) => {
		if (selectedItems.has(value)) {
			selectedItems.delete(value);
		} else {
			selectedItems.add(value);
		}
		setSelectedItems(new Set(selectedItems));
	};

	const verifyChildrenAreValid = () => {
		Children.forEach(rawChildren as JSX.Element[], (child) => {
			if (child.type !== MultiSelectMenuItem) {
				throw new Error('FormMultiSelect only accepts MultiSelectMenuItem as direct children');
			}
		});
	};

	const initialiseChildren = () => {
		setItems(
			Children.toArray(rawChildren)
				.map((child: ReactElement) => (
					cloneElement(child, {
						control,
						selectedItems,
						parentName: name,
						toggleSelectedItem,
					})
				))
		);
	};

	useEffect(() => {
		verifyChildrenAreValid();
		initialiseChildren();
	}, [rawChildren]);

	const preventInputUnfocus = (e) => {
		if (e.key !== 'Escape') e.stopPropagation();
	};

	return (
		<FormSelect
			multiple
			defaultValue={[]}
			control={control}
			name={name}
			renderValue={() => Array.from(selectedItems).map(({ label }) => label).join(', ')}
			value={Array.from(selectedItems).map(({ value }) => value)}
			{...props}
		>
			<SearchInput
				placeholder={formatMessage({ id: 'form.multiSelect.search.placeholder', defaultMessage: 'Search...' })}
				onKeyDown={preventInputUnfocus}
			/>
			{filteredItems.length > 0 ? (
				<ScrollArea autoHeight>
					{filteredItems}
				</ScrollArea>
			) : (
				<NoResults>
					<FormattedMessage
						id="form.multiSelect.search.emptyList"
						defaultMessage="No results"
					/>
				</NoResults>
			)}
		</FormSelect>
	);
};

export const FormMultiSelectWithValue = (props) => {
	const [items, setItems] = useState([]);

	return (
		<SearchContextComponent fieldsToFilter={['props.label']} items={items}>
			<ContextualisedMultiSelect setItems={setItems} {...props}/>
		</SearchContextComponent>
	);
};
