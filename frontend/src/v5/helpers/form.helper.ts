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

// eslint-disable-next-line @stylistic/max-len
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
 */

export const nullifyEmptyObjects = (tree) => Object.fromEntries(
	Object.keys(tree).map((key) => {
		const value = tree[key];
		if (value === '') {
			return [key, null];
		}

		if (isBasicValue(value)) {
			return [key, value];
		}

		return [key, nullifyEmptyObjects(value)];
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

		return ({ ...accum, [key]: removeEmptyObjects(value) });
	}, {});
};

export const diffObjects = (objec1, object2) => {
	const keyObjc2 = Object.keys(object2);

	return Object.keys(objec1).reduce((accum, key) => {
		if (keyObjc2.includes(key)) {
			if (_.isEqual(objec1[key], object2[key])) {
				return accum;
			} if (isBasicValue(objec1[key])) {
				return { ...accum, [key]: objec1[key] };
			}

			return { ...accum, [key]: diffObjects(objec1[key], object2[key]) };
		}

		return { ...accum, [key]: objec1[key] };
	}, {});
};

export const mapArrayToFormArray = (arr = []) => arr.map((value) => ({ value }));
export const mapFormArrayToArray = (arr = []) => arr.map((v) => v.value);