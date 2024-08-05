console.displayError = ({ error, details }, account) => {
   console.error(
      `[Error] ${error}${
         details
            ? `\n[Details] ${typeof details === 'string' ? details : JSON.stringify(details)}`
            : ''
      }${account?.username ? `\n[Account] ${account.user?.id} - ${account.username}` : ''}`
   );
};
