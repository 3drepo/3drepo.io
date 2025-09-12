import { TicketsCardActions } from "@/v5/store/tickets/card/ticketsCard.redux";
import { selectCardFilters, selectIsEditingGroups, selectIsShowingPins, selectReadOnly, selectSelectedTemplateId, selectSelectedTicketId, selectSelectedTicketPinId, selectView } from "@/v5/store/tickets/card/ticketsCard.selectors";
import { TicketsCardViews } from "@/v5/ui/routes/viewer/tickets/tickets.constants";
import { createTestStore } from "../../test.helpers";
import { BaseFilter, TicketFilter } from '@components/viewer/cards/cardFilters/cardFilters.types';
import { DEFAULT_FILTERS, templatesToFilters } from '@components/viewer/cards/cardFilters/filtersSelection/tickets/ticketFilters.helpers';


describe('Tickets: store', () => {
	let dispatch, getState;
	const ticketId = 'ticketId';
	const templateId = 'templateId';
	const pinId = 'pinId';

	beforeEach(() => {
		({ dispatch, getState } = createTestStore());
	});
	describe('card', () => {
		it('should set the highlighted ticket ID', () => {
			dispatch(TicketsCardActions.setSelectedTicket(ticketId));
			const selectedTicketIdFromState = selectSelectedTicketId(getState());
		
			expect(selectedTicketIdFromState).toEqual(ticketId);
		});
		it('should set the selected template ID', () => {
			dispatch(TicketsCardActions.setSelectedTemplate(templateId));
			const selectedTemplateIdFromState = selectSelectedTemplateId(getState());
		
			expect(selectedTemplateIdFromState).toEqual(templateId);
		});

		it('should set the selected ticket pin ID', () => {
			dispatch(TicketsCardActions.setSelectedTicketPin(pinId));
			const selectedTicketPinIdFromState = selectSelectedTicketPinId(getState());
		
			expect(selectedTicketPinIdFromState).toEqual(pinId);
		});
		it('should set the selected view', () => {
			const updatedView = TicketsCardViews.New;
			dispatch(TicketsCardActions.setCardView(updatedView));
			const cardViewFromState = selectView(getState());
		
			expect(cardViewFromState).toEqual(updatedView);
		});
		it('should set the read only status of the card', () => {
			dispatch(TicketsCardActions.setReadOnly(true));
			const readOnlyFromState = selectReadOnly(getState());
		
			expect(readOnlyFromState).toEqual(true);
		});

		it('should set if the groups are being editted', () => {
			dispatch(TicketsCardActions.setEditingGroups(true));
			const EditingGroupsFromState = selectIsEditingGroups(getState());
		
			expect(EditingGroupsFromState).toEqual(true);
		});

		it('should set if the pins are showing', () => {
			dispatch(TicketsCardActions.setIsShowingPins(false));
			const showingPinsFromState = selectIsShowingPins(getState());
		
			expect(showingPinsFromState).toEqual(false);
		});

		// describe('filters', () => {
		// 	// const [ticketTitleFilter, ticketIdFilter, templateIdFilter, ownerFilter] = DEFAULT_FILTERS;
		// 	const [ticketTitleFilter, ticketIdFilter, templateIdFilter, ownerFilter] = templatesToFilters([]);
		// 	const baseFilter: BaseFilter = {
		// 		operator: 'is',
		// 		values: [],
		// 	};
		// 	const editedBaseFilter: BaseFilter = {
		// 		operator: 'gt',
		// 		values: [2],
		// 	};
		// 	const ticketIdCardFilter: TicketFilter = { ...ticketIdFilter, filter: baseFilter };
		// 	const ticketTitleCardFilter: TicketFilter = { ...ticketTitleFilter, filter: baseFilter };
		// 	const updatedTicketTitleCardFilter: TicketFilter = { ...ticketTitleCardFilter, filter: editedBaseFilter };

		// })

		it('should reset the state', () => {
			const [ticketTitleFilter] = templatesToFilters([]);
			const baseFilter: BaseFilter = {
				operator: 'is',
				values: [],
			};
			const ticketTitleCardFilter: TicketFilter = { ...ticketTitleFilter, filter: baseFilter };
			dispatch(TicketsCardActions.setSelectedTicket(ticketId));
			dispatch(TicketsCardActions.setSelectedTemplate(templateId));
			dispatch(TicketsCardActions.setSelectedTicketPin(pinId));
			dispatch(TicketsCardActions.setFilters([ticketTitleCardFilter]));
			dispatch(TicketsCardActions.resetFilters());
			dispatch(TicketsCardActions.resetState());

			const selectedTicketIdFromState = selectSelectedTicketId(getState());
			const selectedTemplateIdFromState = selectSelectedTemplateId(getState());
			const selectedTicketPinIdFromState = selectSelectedTicketPinId(getState());
			// const filters = selectCardFilters(getState());
		
			expect(selectedTicketIdFromState).toEqual(null);
			expect(selectedTemplateIdFromState).toEqual(null);
			expect(selectedTicketPinIdFromState).toEqual(null);
			// expect(filters).toEqual([]);
		});
	});
});
