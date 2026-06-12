const scannerService = require('../services/scannerService');
const apiResponse = require('../utils/apiResponse');

const scan = async (req, res, next) => {
  try {
    const results = await scannerService.runScanner(req.query);
    return apiResponse.success(res, { results, count: results.length }, 'Scan complete');
  } catch (err) {
    next(err);
  }
};

module.exports = { scan };

