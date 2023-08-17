const router = require('express').Router();
const fileUploader = require('../config/cloudinary');
const User = require('../models/User.model');

router.get('/', (req, res, next) => {
  res.json('All good in here');
});
const {isAuthenticated} = require('../middlewares/jwt.middleware');

router.post('/upload', fileUploader.single('imageUrl'), isAuthenticated, (req, res, next) => {
  try{
    if (!req.file) {
      next(new Error('No file uploaded!'));
      return;
    } else {
      User.create({ imageUrl: req.file.path }).then((fileUrl) => {
        res.json({ fileUrl: req.file.path });
      });
    }
  }catch(err) {
    console.log("==show=>", err)
   };
});

module.exports = router;
