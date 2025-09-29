const cds = require("@sap/cds");

class BusinessService extends cds.ApplicationService {
  async init() {
    /* const { BusinessTrip } = this.entities;
    this.before(["CREATE", "UPDATE"], "BusinessTrip", (req) => {
      const { startDate, endDate } = req.data || {};
      if (startDate && endDate && endDate < startDate) {
        req.reject(400, "endDate must be on or after startDate");
      }
    });
 */
    return super.init();
  }
}
module.exports = BusinessService;
