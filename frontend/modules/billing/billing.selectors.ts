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

import { createSelector } from 'reselect';

export const selectBillingDomain = (state) => Object.assign({}, state.billing);

export const selectIsPending = createSelector(
	selectBillingDomain,
	(state) => state.isPending
);

export const selectInvoices = createSelector(
	selectBillingDomain,
	(state) => state.invoices
);

export const selectBillingInfo = createSelector(
	selectBillingDomain,
	(state) => state.billingInfo
);

export const selectLicencesInfo = createSelector(selectBillingDomain, (state) => {
	let numLicences = 0;
	let pricePerLicense = null;
	let planId = null;

	if (state.subscriptions.paypal && state.subscriptions.paypal.length > 0) {
		numLicences = state.subscriptions.paypal.reduce((total, item) => {
			return total + item.quantity;
		}, 0);

		planId = state.subscriptions.paypal[0].plan;
		if (planId && state.plans[state.subscriptions.paypal[0].plan]) {
			pricePerLicense = state.plans[state.subscriptions.paypal[0].plan].price;
		}
	}

	if (!planId || !pricePerLicense) {
		const availablePlansIdx = Object.keys(state.plans).filter(
			(key) => state.plans[key].available
		);
		pricePerLicense = availablePlansIdx.length
			? state.plans[availablePlansIdx[0]].price
			: 0;
		planId = availablePlansIdx[0];
	}

	return {
		planId,
		pricePerLicense,
		numLicences
	};
});
