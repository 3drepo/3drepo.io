import { SortedTableContext } from "@controls/sortedTableContext/sortedTableContext";
import { useContext } from "react";
import { HeaderCell, HeaderCellText } from "./ticketsTableHeaders.styles";
import { getPropertyLabel } from "../../../ticketsTable.helper";
import { TicketsTableHeaderFilter } from "./ticketsTableHeaderFilter.component";
import { SortingArrow } from '@controls/sortingArrow/sortingArrow.component';

export const TicketsTableHeader = ({ name, ...props }) => {
    const { isDescendingOrder, onColumnClick, sortingColumn } = useContext(SortedTableContext);
    const isSelected = name === sortingColumn;

    return (
        <HeaderCell name={name} onClick={() => onColumnClick(name)}>
            <HeaderCellText {...props}>
                {getPropertyLabel(name)}
            </HeaderCellText>
            {isSelected && (<SortingArrow ascendingOrder={isDescendingOrder} />)}
            <TicketsTableHeaderFilter propertyName={name}/>
        </HeaderCell>
    );
};