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

import CloudDownload from '@material-ui/icons/CloudDownload';
import { isEmpty, isEqual } from 'lodash';
import React from 'react';

import { LoaderContainer } from '../billing/billing.styles';
import { CustomTable, CELL_TYPES, TableButton } from '../components/customTable/customTable.component';
import { Loader } from '../components/loader/loader.component';
import { Container } from './history.styles';

const INVOICE_REFUND_STATUS = 'Refund';
const INVOICE_COMPLETED_STATUS = 'Completed';
const INVOICE_PAID_STATUS = 'Paid';
const INVOICE_PENDING_STATUS = 'Pending';

const CELL_WIDTH_10 = { HeadingProps: { root: { flex: 10 } }, CellProps: { root: { flex: 10 } } };
const CELL_WIDTH_15 = { HeadingProps: { root: { flex: 15 } }, CellProps: { root: { flex: 15 } } };
const CELL_WIDTH_25 = { HeadingProps: { root: { flex: 25 } }, CellProps: { root: { flex: 25 } } };

const INVOICES_TABLE_CELLS = [
	{ name: 'Number', ...CELL_WIDTH_10 },
	{ name: 'Date', ...CELL_WIDTH_15 },
	{ name: 'Status', ...CELL_WIDTH_10 },
	{ name: 'Description', ...CELL_WIDTH_25 },
	{ name: 'Payment', ...CELL_WIDTH_10 },
	{ name: 'Amount (£)', ...CELL_WIDTH_15 },
	{ type: CELL_TYPES.ICON_BUTTON, CellComponent: TableButton, ...CELL_WIDTH_15 }
];

interface IProps {
	teamspace: any;
	invoices: any[];
	isLoadingBilling: boolean;
	fetchInvoices: (teamspace) => void;
	downloadInvoice: (teamspace, index) => void;
}

interface IState {
	invoices: any[];
	rows: any[];
}

export class History extends React.PureComponent<IProps, IState> {
	public state = { invoices: [], rows: [] };

	public componentDidMount() {
		this.props.fetchInvoices(this.props.teamspace);

		this.setState({
			rows: this.getInvoicesTableRows(this.props.invoices)
		});
	}

	public componentDidUpdate(prevProps) {
		const changes = {} as any;
		const { invoices } = this.props;

		const invoicesChanged = !isEqual(prevProps.invoices, invoices);

		if (invoicesChanged) {
			changes.invoices = invoices;
			changes.rows = this.getInvoicesTableRows(invoices);
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public onDownload = (teamspace, invoiceNo) =>
		this.props.downloadInvoice(teamspace, invoiceNo)

	public getInvoicesTableRows = (invoices = []): any[] => {
		return invoices.map((invoice) => {
			const isInvoiceRefund = invoice.type === 'refund';
			const isInvoicePending = invoice.pending;

			const data = [
				{ value: invoice.invoiceNo },
				{ value: invoice.createdAtDate },
				{ value: isInvoiceRefund ?
					INVOICE_COMPLETED_STATUS : isInvoicePending ? INVOICE_PENDING_STATUS : INVOICE_PAID_STATUS },
				{ value: isInvoiceRefund ?
					INVOICE_REFUND_STATUS : invoice.items[0].description },
				{ value: invoice.gateway },
				{ value: invoice.amount ? invoice.amount.toFixed(1) : '0' },
				{ Icon: CloudDownload, onClick: this.onDownload.bind(null, this.props.teamspace, invoice.invoiceNo) }
			];

			return { ...invoice, data };
		});
	}

	public render() {
		const { rows } = this.state;

		if (this.props.isLoadingBilling) {
			const content = `Loading history data...`;

			return (
				<LoaderContainer>
					<Loader content={content} />
				</LoaderContainer>
			);
		}

		return (
			<Container>
				<CustomTable cells={INVOICES_TABLE_CELLS} rows={rows} />
			</Container>
		);
	}
}
