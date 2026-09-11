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

import _ from 'lodash';
import { UseFormReturn } from 'react-hook-form';

export const dirtyValues = (
	allValues: object,
	dirtyFields: object | boolean,
) => {
// If *any* item in an array was modified, the entire array must be submitted, because there's no way to indicate
// "placeholders" for unchanged elements. `dirtyFields` is true for leaves.
	if (dirtyFields === true || Array.isArray(dirtyFields)) return allValues;

	// Here, we have an object
	return Object.fromEntries(
		Object.keys(dirtyFields).map((key) => [
			key,
			dirtyValues(allValues[key], dirtyFields[key]),
		]),
	);
};

export const dirtyValuesChanged = (formData: UseFormReturn<any>, defaultValues: any) => 
	Object.keys(formData.formState.dirtyFields).some((dirtyField) => formData.getValues(dirtyField) !== defaultValues[dirtyField]);

// eslint-disable-next-line max-len
export const isBasicValue = (value: any) => _.isNull(value) || !!(value?.toDate) || !_.isObject(value) || Array.isArray(value) || _.isString(value) || _.isDate(value);
// value.toDate assumes that is a wrapped date type.

/**
 * returns the tree but if the the leaf is empty, it changes it to null
 * example:
 * const tree = {
 *    properties: {
 *       Description: '',
 *       AnotherLeaf: 'with a value',
 *     }
 *  }
 *
 *  returns
 *    properties: {
 *       Description: null,
 *       AnotherLeaf: 'with a value',
 *     }
 *  }
 *
 * Exception: ViewpointState arrays (hidden/colored/transformed groups overrides) are never turned
 * into null; the backend rejects null for these and requires an actual array (never absent),
 * so an empty array must be sent through as-is (e.g. to persist deleting all overrides).
 */

// ViewpointState is always stored under a property's 'state' key (see properties[key].state
// across the tickets store/schemas), so a tree is a ViewpointState tree if its parent key is 'state'.
// out sibling keys that didn't change (e.g. showHidden), so we can't rely on sibling keys being
// present here - the parent key name is the only reliable signal left at this point.
const VIEWPOINT_STATE_ARRAY_KEYS = ['hidden', 'colored', 'transformed'];
const isViewpointStateParentKey = (parentKey) => parentKey === 'state';

export const nullifyEmptyObjects = (tree, parentKey?: string) => Object.fromEntries(
	Object.keys(tree).flatMap((key) => {
		const value = tree[key];
		const isEmptyArray = Array.isArray(value) && value.length === 0;

		if (isEmptyArray && isViewpointStateParentKey(parentKey) && VIEWPOINT_STATE_ARRAY_KEYS.includes(key)) {
			return [[key, value]];
		}

		if (value === '' || isEmptyArray) {
			return [[key, null]];
		}

		if (isBasicValue(value)) {
			return [[key, value]];
		}

		return [[key, nullifyEmptyObjects(value, key)]];
	}),
);

/**
 * It returns only the values that doesnt match the errors in the errors object
 */
export const filterErrors = (
	allValues: object,
	errors: object | undefined,
) => Object.keys(allValues).reduce((accum, key) => {
	const value = allValues[key];
	const error = errors[key];

	if (error?.message) {
		return accum;
	}

	if (!errors[key]) {
		return ({ ...accum, [key]: value });
	}
	return ({ ...accum, [key]: filterErrors(value, error) });
}, {});

export const removeEmptyObjects = (tree) => {
	if (isBasicValue(tree)) return tree;

	return Object.keys(tree).reduce((accum, key) => {
		const value = tree[key];

		if (_.isEqual(value, {})) {
			return accum;
		}

		const sanitizedValue = removeEmptyObjects(value);
		if (_.isEqual(sanitizedValue, {})) {
			return accum;
		}
		return ({ ...accum, [key]: sanitizedValue });
	}, {});
};

export type SelectOption = { value: any, displayValue?:string };
export const mapArrayToFormArray = (arr: any[]  = [] ): SelectOption[] => arr.map((value) => ({ value }));
export const mapFormArrayToArray = <T extends SelectOption>(arr: T[] = []) => arr.map((v) => v.value);