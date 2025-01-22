const express = require("express");
const { trackOpen, trackClick } = require("../services/trakingService");
const router = express.Router();

router.route("/open").get(trackOpen);
router.route("/click").get(trackClick);

module.exports = router;

// *********Testing Click Tracking:

// For RR campaign
// GET http://localhost:8000/api/v1/tracking/click?email=9v019x4pxfpnwfd@rr.com&campaign=e9ba3a6c-4f6e-4a0f-93d0-79ef093a8d7e&destination=https://www.google.com/

// For Charter campaign
// GET http://localhost:8000/api/v1/tracking/click?email=kgilpin@charter.net&campaign=charterWiQOMd3VDY4pLmo&destination=https://www.google.com/

// For Test campaign
// GET http://localhost:8000/api/v1/tracking/click?email=test@example.com&campaign=kUTWtrcc16piOG2&destination=https://www.google.com/

// *********Testing Open Tracking:

// For RR campaign
// GET http://localhost:8000/api/v1/tracking/open?email=test@example.com&campaign=2783857e-2d2a-4c56-8db2-f4611569bd41

// For Charter campaign
// GET http://localhost:8000/api/v1/tracking/open?email=kgilpin@charter.net&campaign=charterWiQOMd3VDY4pLmo

// For RR campaign
// GET http://localhost:8000/api/v1/tracking/open?email=9v019x4pxfpnwfd@rr.com&campaign=e9ba3a6c-4f6e-4a0f-93d0-79ef093a8d7e
