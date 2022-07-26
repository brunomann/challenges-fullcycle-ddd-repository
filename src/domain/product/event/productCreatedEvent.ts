import EventInterface from "../../@shared/event/eventInterface";

export default class ProductCreatedEvent implements EventInterface{
    dateOccured:Date;
    eventData: any;

    constructor(eventData: any)
    {
        this.dateOccured = new Date();
        this.eventData = eventData;
    }
}