sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"at/clouddna/employee/test/integration/pages/BusinessTripList",
	"at/clouddna/employee/test/integration/pages/BusinessTripObjectPage"
], function (JourneyRunner, BusinessTripList, BusinessTripObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('at/clouddna/employee') + '/index.html',
        pages: {
			onTheBusinessTripList: BusinessTripList,
			onTheBusinessTripObjectPage: BusinessTripObjectPage
        },
        async: true
    });

    return runner;
});

