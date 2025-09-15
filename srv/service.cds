using {at.clouddna as my} from '../db/schema';

service BusinessService @(path: 'business') {
    @requires              : 'dienstreise.read.own'
    @restrict              : [{
        grant: 'READ',
        to   : 'Mitarbeiter',
        where: 'employee_ID = $user'
    }]

    @cds.redirection.target: 'AllBusinessTrips'
    entity BusinessTrip          as projection on my.BusinessTrip;

    @requires: 'dienstreise.read.all'
    @restrict: [{
        grant: 'READ',
        to   : [
            'Backoffice',
            'Administrator'
        ]
    }]

    entity AllBusinessTrips      as projection on my.BusinessTrip;

    @requires: 'dienstreise.create'
    @restrict: [{
        grant: 'CREATE',
        to   : 'Mitarbeiter'
    }]
    entity CreateBusinessTrip    as projection on my.BusinessTrip;

    @requires: 'dienstreise.update.own'
    @restrict: [{
        grant: 'UPDATE',
        to   : 'Mitarbeiter',
        where: 'employee_ID = $user'
    }]
    entity UpdateOwnBusinessTrip as projection on my.BusinessTrip;

    @requires: 'dienstreise.update.any'
    @restrict: [{
        grant: 'UPDATE',
        to   : [
            'Backoffice',
            'Administrator'
        ]
    }]
    entity UpdateAnyBusinessTrip as projection on my.BusinessTrip;

    @requires: 'dienstreise.comment'
    entity Comment               as projection on my.Comment;

    @requires: 'attachments.manage'
    entity Attachment            as projection on my.Attachment;

    @requires: 'flightroute.read'
    entity FlightRoute           as projection on my.FlightRoute;

    @requires: 'flightroute.manage'
    entity ManageFlightRoute     as projection on my.FlightRoute;

}
