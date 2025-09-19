sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";
  return Controller.extend(
    "at.clouddna.employee.controller.EmpBusinessObjectPage",
    {
      onInit: function () {
        let oRouter = this.getOwnerComponent().getRouter();
        oRouter
          .getRoute("EmpBusinessObjectPage")
          .attachPatternMatched(this._onPatternMatched, this);
      },

      _onPatternMatched: function (oEvent) {
        let sID = oEvent.getParameter("arguments").key;
        let sPath = "/BusinessTrip(" + sID + ")";
        // View an den Pfad binden
        this.getView().bindElement({
          path: sPath,
        });
      },
      formatStatusState: function (sStatus) {
        if (sStatus === "Neu") {
          return "Information";
        } else if (
          sStatus === "Bereit zur Bearbeitung" ||
          sStatus === "In Bearbeitung"
        ) {
          return "Warning";
        } else if (sStatus === "Gebucht") {
          return "Indication06";
        } else if (sStatus === "Abgeschlossen") {
          return "Success";
        } else if (sStatus === "Storniert") {
          return "Error";
        } else {
          return "None";
        }
      },
      formatFileSize: function (size) {
        if (size === null || size === undefined) return "";
        if (size < 1024) return size + " B";
        if (size < 1024 * 1024) return Math.round(size / 1024) + " KB";
        return Math.round(size / (1024 * 1024)) + " MB";
      },
      formatDateTime: function (v) {
        if (!v) return "";
        try {
          return new Date(v).toLocaleString();
        } catch (e) {
          return v;
        }
      },
      formatMessage: function (m) {
        if (!m) return "";
        return m.replace(/\n/g, "<br/>");
      },
    }
  );
});
