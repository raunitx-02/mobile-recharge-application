function generateOTP() {
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    return '123456';
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = {
  generateOTP
};
