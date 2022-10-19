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
import { Button } from '@controls/button';
import { FormSelectBase, FormSelectBaseProps } from '@controls/formSelect/formSelectBase/formSelectBase.component';
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

type FormSearchSelectItemsProps = {
	onItemClick?: (item: any) => void;
	itemIsSelected?: (item: any) => void;
	intialiseSelectedItem?: (children, defaultValue) => void;
};

export type FormSearchSelectProps = FormSelectBaseProps & FormSearchSelectItemsProps & {
	value?: any;
	search?: boolean;
};

export const FormSearchSelect = ({
	children: rawChildren,
	onItemClick,
	itemIsSelected,
	intialiseSelectedItem,
	value,
	defaultValue: inputDefaultValue,
	search = false,
	control,
	name,
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

	const refreshRenderValue = () => {
		// if (!renderValueRef.current?.selected) {
		// 	console.log("click here")
			renderValueRef.current?.click();
		// }
	};

	const populateChildren = () => {
		setItems(
			Children.toArray(rawChildren)
				.map((child: ReactElement) => {
					const { children, value: childValue } = child.props;
					return cloneElement(child, {
						[SEARCH_VALUE_PROP]: onlyText(children),
						selected: itemIsSelected({ value: childValue, children }),
						onClick: () => onItemClick({ value: childValue, children }),
					});
				}),
		);
	};

	const defaultValue = control?.defaultValuesRef?.current?.[name] ?? inputDefaultValue;

	useEffect(() => {
		populateChildren();
		console.log("[value] ->", value)
	}, [value, rawChildren]);
	
	useEffect(() => {
		refreshRenderValue();
		console.log("[itemIsSelected]")
	}, [itemIsSelected]);

	useEffect(() => {
		intialiseSelectedItem(defaultValue, rawChildren);
	}, [inputDefaultValue]);

	return (
		<SearchContextComponent fieldsToFilter={[`props.${SEARCH_VALUE_PROP}`]} items={items}>
			<FormSelectBase
				value={value ?? defaultValue}
				defaultValue={defaultValue}
				control={control}
				name={name}
				{...props}
			>
				{search && (
					<SearchInputContainer>
						<SearchInput
							placeholder={formatMessage({ id: 'form.searchSelect.searchInput.placeholder', defaultMessage: 'Search...' })}
							onClick={preventInputUnfocus}
						/>
					</SearchInputContainer>
				)}
				<MenuContent />
				<RenderValueTrigger ref={renderValueRef} key={RenderValueTrigger} />
			</FormSelectBase>
		</SearchContextComponent>
	);
};
