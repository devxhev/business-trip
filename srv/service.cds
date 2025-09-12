using {at.clouddna as my} from '../db/schema';

service BusinessService @(path: 'business') {
    entity Employee as projection on my.Employee;
    entity BusinessTrip as projection on my.BusinessTrip;
    entity Booking as projection on my.Booking;
}
