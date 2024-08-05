const dayjs = require('dayjs');
require('dayjs/locale/fr');
dayjs.locale('fr');

module.exports = (date, { date: displayDate = true, time: displayTime = false } = {}) => {
   if (!date) return '';

   let result = '';
   date = dayjs(date);

   if (displayDate) {
      if (date.isSame(dayjs(), 'day')) {
         result = "aujourd'hui";
      } else if (date.isSame(dayjs().add(1, 'day'), 'day')) {
         result = 'demain';
      } else {
         result = date.format(`dddd${date.isAfter(dayjs().add(7, 'days')) ? ' D MMMM' : ''}`);
      }
   }

   if (displayTime) {
      if (displayDate) result += ' à ';
      result += date.format('HH:mm');
   }

   return result;
};
