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
import { Children, cloneElement, ReactElement, useContext, useEffect, useRef, useState } from 'react';
import { onlyText } from 'react-children-utilities';
import { FormattedMessage } from 'react-intl';
import { SearchInput, NoResults, RenderValueTriggerer } from './formMultiSelect.styles';
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

export type FormMultiSelectProps = FormSelectProps & {
	children: JSX.Element | JSX.Element[],
	renderValue?: (selectedItems: any[]) => any;
};

export const FormMultiSelect = ({ children: rawChildren, control, name, renderValue, ...props }: FormMultiSelectProps) => {
	const [selectedItems, setSelectedItems] = useState([]);
	const [items, setItems] = useState([]);
	const renderValueRef = useRef<HTMLLIElement>();

	const toggleItemSelection = (item) => {
		setSelectedItems((items) => {
			if (!items.length) {
				renderValueRef?.current?.click();
			}
			return xorWith(items, [item], isEqual);
		})
	};

	const itemIsSelected = (itemValue) => !!selectedItems.find(({ value }) => isEqual(value, itemValue));

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
					cloneElement(child, {
						toggleItemSelection,
						itemIsSelected,
						searchValue: onlyText(child.props.children),
					})
				))
		);
	};

	const formatRenderValue = () => (
		renderValue?.(selectedItems) || selectedItems.map(({ children }) => children).join(", ")
	);

	useEffect(() => {
		verifyChildrenAreValid();
		populateChildren();
	}, [rawChildren]);

	// necessary because cloneElement does not keep track of
	// changes in the props passed to children (so the latter
	// do not have the updated value for selectedItems)
	useEffect(() => { populateChildren(); }, [selectedItems]);

	return (
		<SearchContextComponent fieldsToFilter={['props.searchValue']} items={items}>
			<FormSelect
				multiple
				defaultValue={[]}
				control={control}
				name={name}
				renderValue={formatRenderValue}
				value={selectedItems.map(({ value }) => value)}
				{...props}
			>
				<SearchInput
					placeholder={formatMessage({ id: 'form.multiSelect.search.placeholder', defaultMessage: 'Search...' })}
					onKeyDown={preventInputUnfocus}
				/>
				<RenderValueTriggerer ref={renderValueRef} />
				<MenuContent />
			</FormSelect>
		</SearchContextComponent>
	);
};
