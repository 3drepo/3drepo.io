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

import { put, takeLatest, all } from 'redux-saga/effects';

import * as API from '../../services/api';
import { BillingTypes, BillingActions } from './billing.redux';
import { DialogActions } from "../dialog";

export function* fetchPlans() {
  try {
		const { data: plans } = yield API.getPlans();

		return yield put(BillingActions.fetchPlansSuccess({ ...plans }));
  } catch (e) {
		yield put(DialogActions.showErrorDialog("fetch", "plans", e.response));
  }
}

export function* fetchSubscriptions({ teamspace }) {
  try {
		const { data: subscriptions } = yield API.getSubscriptions(teamspace);

		return yield put(BillingActions.fetchSubscriptionsSuccess({ ...subscriptions }));
  } catch (e) {
		yield put(DialogActions.showErrorDialog("fetch", "subscriptions", e.response));
  }
}

export function* fetchInvoices({ teamspace }) {
  try {
		const { data: invoices } = yield API.getInvoices(teamspace);

		return yield put(BillingActions.fetchInvoicesSuccess({ ...invoices }));
  } catch (e) {
    yield put(DialogActions.showErrorDialog("fetch", "invoices", e.response));
  }
}

export function* fetchBillingData({ teamspace }) {
	try {
		return yield all([
      put(BillingActions.fetchPlans()),
			put(BillingActions.fetchInvoices(teamspace)),
			put(BillingActions.fetchSubscriptions(teamspace))
    ]);
	} catch (e) {
		yield put(DialogActions.showErrorDialog("fetch", "invoices", e.response));
	}
}

export default function* BillingSaga() {
	yield takeLatest(BillingTypes.FETCH_PLANS, fetchPlans);
	yield takeLatest(BillingTypes.FETCH_INVOICES, fetchInvoices);
	yield takeLatest(BillingTypes.FETCH_SUBSCRIPTIONS, fetchSubscriptions);
	yield takeLatest(BillingTypes.FETCH_BILLING_DATA, fetchBillingData);
}
