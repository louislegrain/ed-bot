const express = require('express');
const fs = require('fs');
const nacl = require('tweetnacl');
const path = require('path');

const router = express.Router();

const commands = {};

fs.readdirSync(path.resolve(__dirname, '../../../commands')).forEach(command => {
   const [, name] = command.match(/^(.+)\.js$/) || [];
   command = require(`../../../commands/${command}`);
   commands[name] = command;
});

router.post('/', (req, res) => {
   const signature = req.get('X-Signature-Ed25519');
   const timestamp = req.get('X-Signature-Timestamp');
   let verified = false;

   try {
      verified = nacl.sign.detached.verify(
         Buffer.from(timestamp + JSON.stringify(req.body)),
         Buffer.from(signature, 'hex'),
         Buffer.from(process.env.PUBLIC_KEY, 'hex')
      );
   } catch (err) {}

   if (!verified) return res.status(401).json({ error: 'Invalid request signature.' });

   if (req.body.type === 1) return res.json({ type: 1 });

   const command = commands[req.body.data?.name];
   if (!command)
      return res.json({
         type: 4,
         data: { content: "Il semble que cette commande n'existe plus." },
      });
   command(res, req.body);
});

module.exports = router;
