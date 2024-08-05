const crypto = require('crypto');

module.exports = text => {
   const iv = crypto.randomBytes(16);

   const cipher = crypto.createCipheriv(
      process.env.ENCRYPT_ALGO,
      process.env.ENCRYPT_SECRET,
      iv
   );
   const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

   return {
      iv: iv.toString('hex'),
      content: encrypted.toString('hex'),
   };
};
