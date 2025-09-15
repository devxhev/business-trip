using BusinessService as service from '../../srv/service';

annotate service.BusinessTrip with @(
    UI.FieldGroup #GeneratedGroup: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: 'validFrom',
                Value: validFrom,
            },
            {
                $Type: 'UI.DataField',
                Label: 'validTo',
                Value: validTo,
            },
            {
                $Type: 'UI.DataField',
                Label: 'startDate',
                Value: startDate,
            },
            {
                $Type: 'UI.DataField',
                Label: 'endDate',
                Value: endDate,
            },
            {
                $Type: 'UI.DataField',
                Label: 'destination',
                Value: destination,
            },
            {
                $Type: 'UI.DataField',
                Label: 'meansOfTransport',
                Value: meansOfTransport,
            },
        ],
    },
    UI.Facets                    : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'GeneratedFacet1',
        Label : 'General Information',
        Target: '@UI.FieldGroup#GeneratedGroup',
    }, ],
    UI.LineItem                  : [
        {
            $Type: 'UI.DataField',
            Value: employee_ID,
            Label: 'employee_ID',
        },
        {
            $Type: 'UI.DataField',
            Label: 'startDate',
            Value: startDate,
        },
        {
            $Type: 'UI.DataField',
            Label: 'endDate',
            Value: endDate,
        },
        {
            $Type: 'UI.DataField',
            Label: 'destination',
            Value: destination,
        },
        {
            $Type: 'UI.DataField',
            Value: meansOfTransport,
            Label: 'meansOfTransport',
        },
        {
            $Type: 'UI.DataField',
            Value: hotel_ID,
            Label: 'hotel_ID',
        },
        {
            $Type: 'UI.DataField',
            Value: status_ID,
            Label: 'status_ID',
        },
    ],
);
