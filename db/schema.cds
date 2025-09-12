using {cuid, managed, temporal} from '@sap/cds/common';

namespace at.clouddna;
entity Employee : cuid, managed {
    name: String;
    email: String;
}
entity BusinessTrip : cuid, managed, temporal {
    employee : Association to Employee;
    startDate: Date @assert.notNull;
    endDate: Date @assert.notNull;
    destination: String @assert.notNull;
    meansOfTransport: MeansOfTransport @assert.notNull;
    status: Association to Status;
    comments: Composition of many Comment on comments.businessTrip = $self;
    hotel: String;
    attachments: Composition of many Attachment on attachments.businessTrip = $self;
}

entity Flight : cuid {
    businessTrip : Association to BusinessTrip;
    flightRoute: Association to one FlightRoute;
}

entity Comment : cuid, managed {
    businessTrip : Association to BusinessTrip;
    message      : String;
}

entity FlightRoute : cuid{
    departureLocation : String;
    arrivalLocation : String;
    flightNumber : String(20);
    departureTime: Time;
    arrivalTime: Time;
}
entity Booking : cuid {
    businessTrip : Association to BusinessTrip;
    employee : Association to Employee;
    bookingNumber: Integer;
    status: Association to Status;
}
entity Attachment : cuid, managed {
    businessTrip : Association to BusinessTrip;
    image: LargeBinary @Core.MediaType: imageType;
    imageType: String @Core.IsMediaType;

}

entity Status: cuid, temporal {
    name: String;
    description: localized String;
}
type MeansOfTransport: String enum {
    Auto;
    Zug;
    Flug;
}