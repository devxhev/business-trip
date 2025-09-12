using {cuid, managed, temporal} from '@sap/cds/common';

namespace at.clouddna;
entity Employee : cuid, managed {
    name: String;
    email: String;
    createdAt: type of managed:createdAt;
    createdBy: type of managed:createdBy;
    modifiedBy: type of managed:modifiedBy;
    modifiedAt: type of managed:modifiedAt;
}
entity BusinessTrip : cuid, managed, temporal {
    employeeID : Association to many Employee;
    startDate: Date @assert.notNull;
    endDate: Date @assert.notNull;
    destination: String @assert.notNull;
    meansOfTransport: MeansOfTransport @assert.notNull;
    status: Association to Status;
    comments: Composition of many {
        message: String;
        createdAt: type of managed:createdAt;
        createdBy: type of managed:createdBy;
        modifiedAt: type of managed:modifiedAt;
        modifiedBy: type of managed:modifiedBy;
    };
    hotel: String;
    attachments: Composition of many Attachment on attachments.businessTrip = $self;
}

entity Flight : cuid {
    businessTrip : Association to many BusinessTrip;
    flightRoute: Association to one FlightRoute;
}

entity FlightRoute : cuid{
    departureLocation : String;
    arrivalLocation : String;
    flightNumber : String(20);
    departureTime: Time;
    arrivalTime: Time;
}
entity Booking : cuid {
    businessTripID : Association to BusinessTrip;
    employeeID : Association to Employee;
    bookingNumber: Integer;
    status: Association to Status;
}
entity Attachment : cuid, managed {
    businessTrip : Association to BusinessTrip;
    image: LargeBinary @Core.MediaType: imageType @Core.ContentDisposition.FileName: fileName;
    imageType: String @Core.IsMediaType;
    fileName: String;
    createdBy: type of managed:createdBy;
    createdAt: type of managed:createdAt;

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