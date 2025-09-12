sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"at/clouddna/employee/test/integration/pages/EmployeeList",
	"at/clouddna/employee/test/integration/pages/EmployeeObjectPage"
], function (JourneyRunner, EmployeeList, EmployeeObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('at/clouddna/employee') + '/index.html',
        pages: {
			onTheEmployeeList: EmployeeList,
			onTheEmployeeObjectPage: EmployeeObjectPage
        },
        async: true
    });

    return runner;
});

