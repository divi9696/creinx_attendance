exports.validateIP = (req, res, next) => {
  // TODO: Validate IP address against whitelist
  next();
};

exports.getClientIP = (req) => {
  return req.ip ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         req.connection.socket.remoteAddress;
};
