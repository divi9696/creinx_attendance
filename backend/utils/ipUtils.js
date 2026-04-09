const geoip = require('geoip-lite');

exports.getLocationFromIP = (ipAddress) => {
  return geoip.lookup(ipAddress);
};

exports.isIPInRange = (ip, cidr) => {
  // TODO: Implement CIDR notation validation
  return true;
};

exports.validateIPAddress = (ip) => {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([\da-f]{0,4}:){7}[\da-f]{0,4}$/i;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};
