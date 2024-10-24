import { TicketsCardActions } from "@/v5/store/tickets/card/ticketsCard.redux";
import { selectFilteringCompleted, selectFilteringQueries, selectFilteringTemplates, selectIsEditingGroups, selectIsShowingPins, selectReadOnly, selectSelectedTemplateId, selectSelectedTicketId, selectSelectedTicketPinId, selectView } from "@/v5/store/tickets/card/ticketsCard.selectors";
import { TicketsCardViews } from "@/v5/ui/routes/viewer/tickets/tickets.constants";
import { createTestStore } from "../../test.helpers";


describe('Tickets: store', () => {
	let dispatch, getState;
	const ticketId = 'ticketId';
	const templateId = 'templateId';
	const pinId = 'pinId';
	const query = 'query';

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

		describe('filters', () => {
			it('should toggle the completed filter', () => {
				dispatch(TicketsCardActions.toggleCompleteFilter());
				const completedFilterFromState1 = selectFilteringCompleted(getState());
				
				expect(completedFilterFromState1).toEqual(true);
				
				dispatch(TicketsCardActions.toggleCompleteFilter());
				const completedFilterFromState2 = selectFilteringCompleted(getState());

				expect(completedFilterFromState2).toEqual(false);
			});
			it('should set template filters', () => {
				dispatch(TicketsCardActions.setTemplateFilters([templateId]));
				const templateFiltersFromState = selectFilteringTemplates(getState());
				
				expect(templateFiltersFromState).toEqual([templateId]);
			});

			it('should set query filters', () => {
				dispatch(TicketsCardActions.setQueryFilters([query]));
				const queryFiltersFromState = selectFilteringQueries(getState());
				
				expect(queryFiltersFromState).toEqual([query]);
			});
		})

		it('should reset the state', () => {
			dispatch(TicketsCardActions.setSelectedTicket(ticketId));
			dispatch(TicketsCardActions.setSelectedTemplate(templateId));
			dispatch(TicketsCardActions.setSelectedTicketPin(pinId));
			dispatch(TicketsCardActions.toggleCompleteFilter());
			dispatch(TicketsCardActions.setTemplateFilters([templateId]));
			dispatch(TicketsCardActions.setQueryFilters([query]));
			dispatch(TicketsCardActions.resetState());

			const selectedTicketIdFromState = selectSelectedTicketId(getState());
			const selectedTemplateIdFromState = selectSelectedTemplateId(getState());
			const selectedTicketPinIdFromState = selectSelectedTicketPinId(getState());
			const completeFilterFromState = selectFilteringCompleted(getState());
			const templateFiltersFromState = selectFilteringTemplates(getState());
			const queryFiltersFromState = selectFilteringQueries(getState());
		
			expect(selectedTicketIdFromState).toEqual(null);
			expect(selectedTemplateIdFromState).toEqual(null);
			expect(selectedTicketPinIdFromState).toEqual(null);
			expect(completeFilterFromState).toEqual(true);
			expect(templateFiltersFromState).toEqual([templateId]);
			expect(queryFiltersFromState).toEqual([query]);
		});
	});
});
