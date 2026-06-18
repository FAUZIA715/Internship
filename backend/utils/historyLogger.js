const History = require('../models/History');

const logHistory = async ({
  candidateId,
  documentId,
  documentType,
  documentName,
  action,
  status,
  previousStatus = null,
  performedBy,
  performedByRole,
  performedByName,
  details = null,
  req = null
}) => {
  try {
    let ipAddress = null;
    let userAgent = null;
    
    if (req) {
      ipAddress = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress;
      userAgent = req.headers['user-agent'];
    }
    
    const historyEntry = await History.create({
      candidateId,
      documentId,
      documentType,
      documentName,
      action,
      status,
      previousStatus,
      performedBy,
      performedByRole,
      performedByName,
      details,
      ipAddress,
      userAgent,
      timestamp: new Date()
    });
    
    console.log(`📝 [HISTORY] ${action} - ${documentName} by ${performedByName}`);
    return historyEntry;
  } catch (error) {
    console.error('History logging error:', error);
  }
};

module.exports = logHistory;