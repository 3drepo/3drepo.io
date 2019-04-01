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
import { getAngularService } from '../../helpers/migration';
import * as API from '../../services/api';
import { CompareTypes, CompareActions } from './compare.redux';
import { selectRevisions } from '../model';
import { selectIsFederation } from './compare.selectors';

const nextRevision = (revisions = [], revision) => {
	if (!revision) {
		return revisions[0];
	}

	const len = revisions.length;
	const index = revisions.findIndex((r) => r._id === revision);

	const lastRev = index + 1 === len;
	if (lastRev) {
		return revisions[index];
	}

	return revisions[index + 1];
};

export function* getCompareModels({settings, revision}) {
	try {
		const revisions = yield select(selectRevisions);
		if (!revision.length) {
			return null;
		}

		const isFederation = yield select(selectIsFederation);
		const baseRevision = isFederation ?
			revisions.find((rev) => rev.tag === revision || rev._id === revision ) || revisions[0] :
			revisions[0];

		const targetRevision = nextRevision(revisions, baseRevision.name);

		const RevisionsService = yield getAngularService('RevisionsService') as any;
		const baseTimestamp = RevisionsService.revisionDateFilter(baseRevision.timestamp);
		const targetTimestamp = RevisionsService.revisionDateFilter(targetRevision.timestamp);

		return {
			account: settings.account,
			model: settings.model,
			name: settings.name,
			revisions,
			baseRevision: baseRevision.name,
			baseRevisionTag: baseRevision.tag || baseTimestamp || baseRevision.name,
			targetRevision: {
				diff: {
					name: targetRevision.name,
					tag: targetRevision.tag || targetTimestamp || targetRevision.name
				},
				clash: {
					name: baseRevision.name,
					tag: baseRevision.tag || baseTimestamp || baseRevision.name
				}
			},
			visible: true
		};
	} catch (error) {
		console.error(error);
	}
}

export default function* CompareSaga() {
	yield takeLatest(CompareTypes.GET_COMPARE_MODELS, getCompareModels);
}
