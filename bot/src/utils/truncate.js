module.exports = (str, maxLength) => {
   str = str.toString();
   if (!maxLength || str.length <= maxLength) return str;
   if (maxLength < 4) return '';

   const result = str.replace(
      new RegExp(
         `^(.{0,${maxLength - 3}})(?<=[A-Za-z0-9À-ÖØ-öø-ÿ])(?![A-Za-z0-9À-ÖØ-öø-ÿ]).*$`
      ),
      '$1...'
   );
   if (result.length > maxLength) return result.substring(0, maxLength - 3) + '...';

   return result;
};
