using {at.clouddna as service} from '../db/schema';

annotate service.BusinessTrip with {
    startDate        @title: 'Start Date';
    endDate          @title: 'End Date';
    destination      @title: 'Destination';
    meansOfTransport @title: 'Means of Transport';
    status           @title: 'Status';
    comments         @title: 'Comments';
    hotel            @title: 'Hotel';
    attachments      @title: 'Attachments';
}
