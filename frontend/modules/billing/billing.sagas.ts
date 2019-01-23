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

import { put, takeLatest, all, select, take } from 'redux-saga/effects';

import * as API from '../../services/api';
import { BillingTypes, BillingActions, selectLicencesInfo, dialogMessages } from './index';
import { DialogActions } from '../dialog';
import { SnackbarActions } from '../snackbar';
import { LoadingDialog } from '../../routes/components/dialogContainer/components';

export function* fetchPlans() {
	try {
		const { data: plans } = yield API.getPlans();

		return yield put(BillingActions.fetchPlansSuccess(plans));
	} catch (e) {
		yield put(DialogActions.showEndpointErrorDialog('fetch', 'plans', e));
	}
}

export function* fetchBillingInfo({ teamspace }) {
	try {
		const { data: plans } = yield API.getBillingInfo(teamspace);

		return yield put(BillingActions.fetchBillingInfoSuccess(plans));
	} catch (e) {
		yield put(DialogActions.showEndpointErrorDialog('fetch', 'billingInfo', e));
	}
}

export function* fetchSubscriptions({ teamspace }) {
	try {
		const { data: subscriptions } = yield API.getSubscriptions(teamspace);
		return yield put(
			BillingActions.fetchSubscriptionsSuccess(subscriptions)
		);
	} catch (e) {
		yield put(
			DialogActions.showEndpointErrorDialog('fetch', 'subscriptions', e)
		);
	}
}

export function* fetchInvoices({ teamspace }) {
	try {
		yield put(BillingActions.setPendingState(true));
		const { data: invoices } = yield API.getInvoices(teamspace);

		yield put(BillingActions.fetchInvoicesSuccess(invoices));
	} catch (e) {
		yield put(BillingActions.setPendingState(false));
		yield put(DialogActions.showEndpointErrorDialog('fetch', 'invoices', e));
	}
}

export function* fetchBillingData({ teamspace }) {
	try {
		yield put(BillingActions.setPendingState(true));

		yield all([
			put(BillingActions.fetchBillingInfo(teamspace)),
			put(BillingActions.fetchPlans()),
			put(BillingActions.fetchSubscriptions(teamspace))
		]);
	} catch (e) {
		yield put(BillingActions.setPendingState(false));
		yield put(DialogActions.showEndpointErrorDialog('fetch', 'invoices', e));
	}
}

export function* changeSubscription({ teamspace, subscriptionData }) {
	try {
		const licencesInfo = yield select(selectLicencesInfo);
		const oldLicencesNum = subscriptionData.billingAddress.licences;
		const newLicencesNum = licencesInfo.numLicences;
		const licencesNumChanged = oldLicencesNum !== newLicencesNum;

		const config = {
			title: dialogMessages.DIALOG_TITLE,
			template: LoadingDialog,
			data: {
				content: licencesNumChanged
					? dialogMessages.LICENCE_COUNT_CHANGED_INFO
					: dialogMessages.LICENCE_COUNT_NOT_CHANGED_INFO
			}
		};

		yield put(DialogActions.showDialog(config));

		const response = yield API.changeSubscription(teamspace, subscriptionData);

		if (response.status === 200) {
			if (licencesNumChanged) {
				window.location.href = response.data.url;
			} else {
				yield put(SnackbarActions.show(dialogMessages.UPDATED_INFO));
			}
		} else {
			yield put(
				DialogActions.showErrorDialog('post', 'subscription', dialogMessages.PAYPAL_ERROR)
			);
		}
	} catch (e) {
		yield put(
			DialogActions.showEndpointErrorDialog('post', 'subscription', e)
		);
	}
}

export function* downloadInvoice({ teamspace, invoiceNo }) {
	try {
		const url = `${ClientConfig.apiUrls.all[0]}/${teamspace}/invoices/${invoiceNo}.pdf`;
		window.open(url, '_blank');
	} catch (e) {
		yield put(DialogActions.showEndpointErrorDialog('download', 'invoice', e));
	}
}

export default function* BillingSaga() {
	yield takeLatest(BillingTypes.FETCH_PLANS, fetchPlans);
	yield takeLatest(BillingTypes.FETCH_INVOICES, fetchInvoices);
	yield takeLatest(BillingTypes.FETCH_SUBSCRIPTIONS, fetchSubscriptions);
	yield takeLatest(BillingTypes.FETCH_BILLING_DATA, fetchBillingData);
	yield takeLatest(BillingTypes.FETCH_BILLING_INFO, fetchBillingInfo);
	yield takeLatest(BillingTypes.CHANGE_SUBSCRIPTION, changeSubscription);
	yield takeLatest(BillingTypes.DOWNLOAD_INVOICE, downloadInvoice);
}
