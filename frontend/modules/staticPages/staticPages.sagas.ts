/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import { put, takeLatest, select } from 'redux-saga/effects';

import { StaticPagesTypes, StaticPagesActions } from './staticPages.redux';
import { getStaticFile } from '../../services/staticPages';
import { selectStaticPagesTemplates } from './staticPages.selectors';

export function* loadTemplate({ path }) {
	const loadedTemplates = yield select(selectStaticPagesTemplates);

	if (!loadedTemplates[path]) {
		yield put(StaticPagesActions.setPendingState(true));
		try {
			const { data: template } = yield getStaticFile(path);
			yield put(StaticPagesActions.loadTemplateSuccess(path, template));
		} catch (error) {
			console.error(error);
		}
		yield put(StaticPagesActions.setPendingState(false));
	}
}

export default function* StaticPagesSaga() {
	yield takeLatest(StaticPagesTypes.LOAD_TEMPLATE, loadTemplate);
}
