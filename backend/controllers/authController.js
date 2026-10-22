const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const registerUser = async (req,res) => {
  try{
    const {name,email,password,role} = req.body;

    //For required fields..
    if(!name || !email || !password) {
      return res.status(400).json(
        {
          message: "Please provide the required fields name, email and password",
        });
    }
    
  
    //To check whether the user is already exists
    const existingUser = await User.findOne({ email });
    if(existingUser) {
      return res.status(400).json(
        {
          message:"User already exists",
        }
      );
    }

    //Hash password
    const hashedPwd = await bcrypt.hash(password, 10);

    //Create User
    const user = await User.create({
      name,
      email,
      password: hashedPwd,
      role: role || "guest",
    });

    res.status(200).json({
      message: "User resgistered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }
    );
  }
  catch (error){
    res.status(500).json({
      message:"Registration failed",
      error:error.message,
    });
  }
};

const loginUser = async (req,res) => {
      try{
        const {email,password} = req.body;

        //Check required fields
        if (!email || !password) {
          return res.status(400).json({
            message: "Please provide email and password",
          });
        }

          //Find user
          const user = await User.findOne({email});
          if (!user) {
            return res.status(401).json({
              message:"Invalid email or password",
            });
          }

          //Compare password
          const isPasswordCorrect = await bcrypt.compare(
            password, user.password
          );

          if (!isPasswordCorrect) {
            return res.status(401).json({
              message:"Invalid email or Password",
            });
          }

          //Generate JWT (jswebtoken)
          const token = jwt.sign(
            {
              userId: user.id,
              role: user.role,
            },
            process.env.JWT_SECRET,
            {
              expiresIn: "7d",
            }
          );

          res.status(200).json({
            message:"Login successful",
            token,
            user:{
              id: user.id,
              name: user.name,
              email: user.email,
              role:user.role,
            },
          });
        } catch(error){
          return res.status(500).json({
            message:"Login failed",
            error:error.message,
          });
        }
      };


module.exports = {registerUser, loginUser};