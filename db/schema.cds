using {cuid, managed, temporal, Country} from '@sap/cds/common';

namespace at.clouddna;
entity Employee : cuid, managed {
    name: String;
    email: String;
}
entity BusinessTrip : cuid, managed, temporal {
    employee : Association to Employee @mandatory;
    startDate: Date @mandatory;
    endDate: Date @mandatory;
    destination: String @mandatory;
    meansOfTransport: MeansOfTransport @mandatory;
    status: Association to Status;
    comments: Composition of many Comment on comments.businessTrip = $self;
    hotel: Association to Hotel;
    attachments: Composition of many Attachment on attachments.businessTrip = $self;
}
entity Hotel : cuid, managed {
    name: String @mandatory;
    address: String @mandatory;
    city: String @mandatory;
    country: Country;
}

entity Flight : cuid {
    businessTrip : Association to BusinessTrip;
    flightRoute: Association to one FlightRoute @assert.notNull;
}

entity Comment : cuid, managed {
    businessTrip : Association to BusinessTrip @assert.notNull;
    message      : String @mandatory;
}

entity FlightRoute : cuid{
    departureLocation : String @mandatory;
    arrivalLocation : String @mandatory;
    flightNumber : String(20) @mandatory;
    departureTime: Time @mandatory;
    arrivalTime: Time @mandatory;
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