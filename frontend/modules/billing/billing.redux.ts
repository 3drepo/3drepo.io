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

import { createActions, createReducer } from 'reduxsauce';

export const { Types: BillingTypes, Creators: BillingActions } = createActions({
	fetchPlans: [],
	fetchPlansSuccess: ['plans'],
	fetchBillingInfo: ['teamspace'],
	fetchBillingInfoSuccess: ['billingInfo'],
	fetchInvoices: ['teamspace'],
	fetchInvoicesSuccess: ['invoices'],
	fetchSubscriptions: ['teamspace'],
	fetchSubscriptionsSuccess: ['subscriptions'],
	fetchBillingData: ['teamspace'],
	changeSubscription: ['teamspace', 'subscriptionData'],
	downloadInvoice: ['teamspace', 'invoiceNo'],
	setPendingState: ['isPending']
}, { prefix: 'BILLING_' });

export const INITIAL_STATE = {
	invoices: [],
	plans: [],
	subscriptions: [],
	billingInfo: {},
	isPending: true
};

const fetchPlansSuccess = (state = INITIAL_STATE, { plans }) =>
	Object.assign({}, state, { plans });

const fetchInvoicesSuccess = (state = INITIAL_STATE, { invoices }) =>
	Object.assign({}, state, { invoices, isPending: false });

const fetchSubscriptionsSuccess = (state = INITIAL_STATE, { subscriptions }) =>
	Object.assign({}, state, { subscriptions, isPending: false });

const fetchBillingInfoSuccess = (state = INITIAL_STATE, { billingInfo }) =>
	Object.assign({}, state, { billingInfo, isPending: false });

export const setPendingState = (state = INITIAL_STATE, { isPending }) =>
	Object.assign({}, state, { isPending });

export const reducer = createReducer(INITIAL_STATE, {
	[BillingTypes.SET_PENDING_STATE]: setPendingState,
	[BillingTypes.FETCH_PLANS_SUCCESS]: fetchPlansSuccess,
	[BillingTypes.FETCH_INVOICES_SUCCESS]: fetchInvoicesSuccess,
	[BillingTypes.FETCH_SUBSCRIPTIONS_SUCCESS]: fetchSubscriptionsSuccess,
	[BillingTypes.FETCH_BILLING_INFO_SUCCESS]: fetchBillingInfoSuccess
});
