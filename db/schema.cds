using {
    cuid,
    managed,
    temporal
} from '@sap/cds/common';

namespace at.clouddna;

entity Employee : cuid, managed {
    name  : String;
    email : String;
}

entity BusinessTrip : cuid, managed, temporal {
    employee         : Association to Employee      @mandatory;
    occasion         : String                       @mandatory;
    startDate        : Date                         @assert.range: [
        null,
        endDate
    ];
    endDate          : Date                         @assert.range: [
        startDate,
        null
    ];
    destination      : String                       @mandatory;
    meansOfTransport : MeansOfTransport             @mandatory;
    status           : Association to Status;
    comments         : Composition of many Comment
                           on comments.businessTrip = $self;
    hotel            : Boolean;
    booking          : Association to one Booking;
    attachments      : Composition of many Attachment
                           on attachments.businessTrip = $self;
    flights          : Composition of many Flight
                           on flights.businessTrip = $self;
    validFrom        : type of temporal : validFrom @default     : $now;
    validTo          : type of temporal : validTo   @default     : '9999-12-31';

}

entity Flight : cuid {
    businessTrip : Association to BusinessTrip;
    flightRoute  : Association to one FlightRoute @assert.notNull;
}

entity Comment : cuid, managed {
    businessTrip : Association to BusinessTrip @assert.notNull;
    message      : String                      @mandatory;
}

entity FlightRoute : cuid {
    departureLocation : String      @mandatory;
    arrivalLocation   : String      @mandatory;
    flightNumber      : String(20)  @mandatory  @assert.unique;
    departureTime     : Time        @mandatory;
    arrivalTime       : Time        @mandatory;
}

entity Booking : cuid {
    bookingNumber : String  @mandatory  @assert.unique;
    status        : Association to Status;
}

entity Attachment : cuid, managed {
    businessTrip : Association to BusinessTrip;

    @Core.MediaType: mediaType  @mandatory  @Core.ContentDisposition: fileName
    content      : LargeBinary;

    @Core.IsMediaType
    mediaType    : String;
    fileName     : String;
    size         : Integer;
    description  : String;
}

entity Status : cuid, temporal {
    name        : String;
    description : String;
}

type MeansOfTransport : String enum {
    Auto;
    Zug;
    Flug;
}
