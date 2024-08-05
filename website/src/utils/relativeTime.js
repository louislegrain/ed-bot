module.exports = seconds =>
   `il y a ${
      seconds < 60
         ? 'quelques secondes'
         : seconds < 3600
           ? `${Math.floor(seconds / 60)} minute${Math.floor(seconds / 60) > 1 ? 's' : ''}`
           : seconds < 86400
             ? `${Math.floor(seconds / 3600)} heure${Math.floor(seconds / 3600) > 1 ? 's' : ''}`
             : `${Math.floor(seconds / 86400)} jour${Math.floor(seconds / 86400) > 1 ? 's' : ''}`
   }`;
