const cds = require("@sap/cds");
const fs = require("fs");
const path = require("path");
const mime = require("mime-types");

class BusinessService extends cds.ApplicationService {
  async init() {
    return super.init();
  }
}

module.exports = BusinessService;
