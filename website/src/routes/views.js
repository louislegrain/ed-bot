module.exports = (req, res) => {
   res.render(req.reqPath, { user: req.user, ...req.data }, (err, html) => {
      if (err)
         return res.status(500).render('error', { user: req.user, ...req.data, code: 500 });
      res.send(html);
   });
};
