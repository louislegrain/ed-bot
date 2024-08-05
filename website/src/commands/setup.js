module.exports = async res => {
   res.json({
      type: 4,
      data: {
         components: [
            {
               type: 1,
               components: [
                  {
                     type: 2,
                     style: 5,
                     label: 'Configurer mon compte',
                     url: `${process.env.BASE_URL}/dashboard`,
                  },
               ],
            },
         ],
      },
   });
};
