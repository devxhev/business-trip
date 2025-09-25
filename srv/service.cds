using {at.clouddna as my} from '../db/schema';

service BusinessService @(path: 'business') {


    /*@requires: 'dienstreise.read.own'
    @restrict: [{
        grant: 'READ',
        to   : 'Mitarbeiter',
        where: 'employee_ID = $user'
    }]*/
    entity BusinessTrip as projection on my.BusinessTrip;

    /*@requires              : 'dienstreise.read.all'
    @restrict              : [{
        grant: 'READ',
        to   : [
            'Backoffice',
            'Administrator'
        ]
    }]*/

    //@cds.redirection.target: 'AllBusinessTrips'
    //entity AllBusinessTrips      as projection on my.BusinessTrip;

    /*@requires: 'dienstreise.create'
    @restrict: [{
        grant: 'CREATE',
        to   : 'Mitarbeiter'
    }]*/

    //entity CreateBusinessTrip    as projection on my.BusinessTrip;

    /*@requires: 'dienstreise.update.own'
    @restrict: [{
        grant: 'UPDATE',
        to   : 'Mitarbeiter',
        where: 'employee_ID = $user'
    }]*/
    //entity UpdateOwnBusinessTrip as projection on my.BusinessTrip;

    /*@requires: 'dienstreise.update.any'
    @restrict: [{
        grant: 'UPDATE',
        to   : [
            'Backoffice',
            'Administrator'
        ]
    }]*/
    //entity UpdateAnyBusinessTrip as projection on my.BusinessTrip;

    //@requires: 'dienstreise.comment'
    entity Comment      as projection on my.Comment;

    //@requires: 'attachments.manage'
    entity Attachment   as
        projection on my.Attachment {
            key ID,
                businessTrip,
                fileName,
                description,
                mediaType,
                size,
                content
        };

    //@requires: 'flightroute.read'
    entity FlightRoute  as projection on my.FlightRoute;
    //@requires: 'flightroute.manage'
    //@cds.redirection.target: 'FlightRoute'
    //entity ManageFlightRoute as projection on my.FlightRoute;

    entity Employee     as projection on my.Employee;
    entity Status       as projection on my.Status;
    entity Booking      as projection on my.Booking;
    entity Airports     as projection on my.Airports;
    entity Flight       as projection on my.Flight;

}

annotate BusinessService.BusinessTrip with @odata.draft.enabled;

annotate BusinessService.BusinessTrip with @(
    UI.FieldGroup #General: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: 'Valid From',
                Value: validFrom
            },
            {
                $Type: 'UI.DataField',
                Label: 'Valid To',
                Value: validTo
            },
            {
                $Type: 'UI.DataField',
                Label: 'Start Date',
                Value: startDate
            },
            {
                $Type: 'UI.DataField',
                Label: 'End Date',
                Value: endDate
            },
            {
                $Type: 'UI.DataField',
                Label: 'Destination',
                Value: destination
            },
            {
                $Type: 'UI.DataField',
                Label: 'Means of Transport',
                Value: meansOfTransport
            }
        ]
    },

    UI.Facets             : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'GeneralInfo',
        Label : 'General Information',
        Target: '@UI.FieldGroup#General'
    }],

    UI.LineItem           : [
        {
            $Type: 'UI.DataField',
            Value: occasion,
            Label: '{i18n>occasion}'
        },
        {
            $Type: 'UI.DataField',
            Value: destination,
            Label: '{i18n>destination}'
        },
        {
            $Type: 'UI.DataField',
            Value: meansOfTransport,
            Label: '{i18n>meansOfTransport}'
        },
        {
            $Type: 'UI.DataField',
            Value: hotel,
            Label: '{i18n>hotel}'
        },
        {
            $Type: 'UI.DataField',
            Value: status.description,
            Label: '{i18n>status}'
        },
        {
            $Type: 'UI.DataField',
            Value: comments.message,
            Label: '{i18n>additionalComments}'
        }
    ]
);
