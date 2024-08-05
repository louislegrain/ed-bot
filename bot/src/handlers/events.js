const { readdirSync } = require('fs');
const path = require('path');

module.exports = client => {
   const events = readdirSync(path.resolve(__dirname, '../events')).filter(name =>
      name.endsWith('.js')
   );
   events.forEach(event => {
      const [, name] = event.match(/^(.+)\.js$/);
      const file = require(`../events/${name}`);
      client.on(name, (...args) => file(client, ...args));
   });
};
