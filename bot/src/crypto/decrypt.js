const crypto = require('crypto');

module.exports = hash => {
   const decipher = crypto.createDecipheriv(
      process.env.ENCRYPT_ALGO,
      process.env.ENCRYPT_SECRET,
      Buffer.from(hash.iv, 'hex')
   );

   const decrypted = Buffer.concat([
      decipher.update(Buffer.from(hash.content, 'hex')),
      decipher.final(),
   ]);

   return decrypted.toString();
};
