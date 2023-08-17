const bcrypt = require('bcryptjs');
 const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const saltRounds = 10;

const router = require('express').Router();
const fileUploader = require("../config/cloudinary")


const {isAuthenticated} = require('../middlewares/jwt.middleware');


router.post('/signup', (req, res, next) => {
  const { username, password, campus, course } = req.body;
  if (username === '' || password === '') {
    res.status(400).json({ message: 'provide username and password' });
    return;
  }

  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!passwordRegex.test(password)) {
    res
      .status(400)
      .json({
        message:
          'Password must have at least 6 characts and contain at least one number, one lowercase and one uppercase letter.',
      });
    return;
  }

  // Check the users collection if a user with the same email already exists
  User.findOne({ username }).then((foundUser) => {
    if (foundUser) {
      res.status(400).json({ message: 'User already exist' });
      return;
    }

    //if the username is uniqure, proceed to hash password
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPasswword = bcrypt.hashSync(password, salt);
    return User.create({ username, password: hashedPasswword, campus, course });
  })

  .then((createUser)=> {
    const { username, password: hashedPasswword, campus, course } = createUser ;
    const user = { username, password: hashedPasswword, campus, course }
    res.status(201).json({user: user})
})
.catch(err => {
    console.log("show me error", err)
})

});





router.post("/login", (req, res, next) => {
 const {username, password} = req.body

 if(!username || !password){
    return  res.status(400).json({message: "Provide email and password"});
 }

User.findOne({username})
.then((foundUser)=>{

    if(!foundUser) {
        res.status(401).json({message: "user not found"})
        return;
     }
// Compare the provided password with the one saved in the database
     const passwordCorrect = bcrypt.compareSync(password, foundUser.password);

     if(passwordCorrect) {
        const {_id, username, campus, course} = foundUser;
        const payload = {_id, username, campus, course}

        const authToken = jwt.sign(
            payload,
            process.env.TOKEN_SECRET,
            { algorithm: 'HS256', expiresIn: "6h" }
        );
        // Send the token as the response
        res.status(200).json({authToken: authToken});
     }else {
        res.status(401).json({message: "Unable to aunthenticate the user"})
     }
})

 .catch(err =>{
  console.log("==show=>", err)
 });
});


router.get('/verify', isAuthenticated, (req, res, next) => {
    console.log("req.payload", req.body);

    res.status(200).json(req.payload);
})

router.get('/profile', isAuthenticated, async (req, res, next) => {
  try{
   const foundUserDB = await User.findOne({username})

   if(!foundUserDB){
    res.status(401).json({message: "user not found"})
    return;
   }else {
    res.status(201).json({foundUserDB: foundUserDB})
   }
  }
  catch(erro){
    res.json("error while getting user",erro)
  }
} )


module.exports = router ;