const cds = require("@sap/cds");

class BusinessService extends cds.ApplicationService {
  async init() {
    // Helper für Required Fields
    const ensureRequiredFields = (data) => {
      console.log("Ensuring required fields for data:", Object.keys(data));

      // Defaults für Required Felder
      if (!data.occasion) {
        data.occasion = "Business Trip";
        console.log("Set default occasion");
      }
      if (!data.destination) {
        data.destination = "Unknown";
        console.log("Set default destination");
      }
      if (!data.startDate) {
        data.startDate = new Date().toISOString().split("T")[0];
        console.log("Set default startDate");
      }
      if (!data.endDate) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        data.endDate = tomorrow.toISOString().split("T")[0];
        console.log("Set default endDate");
      }
      if (!data.meansOfTransport) {
        data.meansOfTransport = "Auto";
        console.log("Set default meansOfTransport");
      }
      if (data.hotel === null || data.hotel === undefined) {
        data.hotel = false;
        console.log("Set default hotel");
      }
    };

    // Helper für Association IDs
    const ensureAssociationIds = (data) => {
      console.log("Ensuring association IDs");

      // Employee-Referenz sicherstellen
      if (data.employee && data.employee.ID && !data.employee_ID) {
        data.employee_ID = data.employee.ID;
        console.log("Set employee_ID:", data.employee_ID);
      }

      // Status-Referenz sicherstellen
      if (data.status && data.status.ID && !data.status_ID) {
        data.status_ID = data.status.ID;
        console.log("Set status_ID:", data.status_ID);
      }

      // Booking-Referenz (optional)
      if (data.booking && data.booking.ID && !data.booking_ID) {
        data.booking_ID = data.booking.ID;
        console.log("Set booking_ID:", data.booking_ID);
      }
    };

    // Helper für Temporal Defaults
    const ensureTemporalDefaults = (data) => {
      const nowISO = new Date().toISOString();
      if (!data.validFrom) {
        data.validFrom = nowISO;
        console.log("Set validFrom:", data.validFrom);
      }
      if (!data.validTo) {
        data.validTo = "9999-12-31T00:00:00.000Z";
        console.log("Set validTo:", data.validTo);
      }
    };

    // **DRAFT ACTIVATE - Kritischer Handler**
    this.before("draftActivate", "BusinessTrip", (req) => {
      console.log("=== DRAFT ACTIVATE HANDLER ===");
      console.log("Original data keys:", Object.keys(req.data || {}));
      console.log("Original data:", JSON.stringify(req.data, null, 2));

      // Sicherstellen dass req.data existiert
      if (!req.data) {
        req.data = {};
        console.log("Created empty req.data object");
      }

      // Alle Defaults setzen
      ensureTemporalDefaults(req.data);
      ensureRequiredFields(req.data);
      ensureAssociationIds(req.data);

      // Null-Werte explizit behandeln
      Object.keys(req.data).forEach((key) => {
        if (req.data[key] === null) {
          console.warn(`NULL value found for ${key}, setting to undefined`);
          req.data[key] = undefined;
        }
      });

      // Kritische Validierung
      if (!req.data.employee_ID) {
        console.error("CRITICAL: employee_ID missing after processing!");
        const error = new Error("Employee-Referenz ist erforderlich");
        error.code = 400;
        throw error;
      }

      console.log(
        "Final draftActivate data:",
        JSON.stringify(req.data, null, 2)
      );
      console.log("=== Ende DRAFT ACTIVATE HANDLER ===");
    });

    // CREATE Handler (wird bei Draft Activation aufgerufen)
    this.before("CREATE", "BusinessTrip", (req) => {
      console.log("=== CREATE HANDLER (from draftActivate) ===");
      console.log("CREATE data:", JSON.stringify(req.data, null, 2));

      ensureTemporalDefaults(req.data);
      ensureRequiredFields(req.data);
      ensureAssociationIds(req.data);

      // Finale Null-Check
      const nullFields = Object.keys(req.data).filter(
        (key) => req.data[key] === null
      );
      if (nullFields.length > 0) {
        console.error("CRITICAL: Null fields in CREATE:", nullFields);
        nullFields.forEach((field) => {
          req.data[field] = undefined; // Null zu undefined
        });
      }

      console.log("Final CREATE data:", JSON.stringify(req.data, null, 2));
      console.log("=== Ende CREATE HANDLER ===");
    });

    // Error Handler
    this.on("error", (err, req) => {
      console.error("=== SERVICE ERROR ===");
      console.error("Error message:", err.message);
      console.error("Error code:", err.code);
      console.error("Request event:", req.event);
      console.error("Request target:", req.target?.name);
      if (req.data) {
        console.error("Request data:", JSON.stringify(req.data, null, 2));
      }
      console.error("=== Ende ERROR ===");
    });

    return super.init();
  }
}

module.exports = BusinessService;
