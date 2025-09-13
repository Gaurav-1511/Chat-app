import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

// signup a new user

export const signup = async (req, res) => {
  const { fullName, email, password, bio } = req.body;
  try {
    if (!fullName || !email || !password || !bio) {
      return res.json({ success: false, message: " Missing deatils" });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.json({ success: false, message: " Account already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName,
      email,
      password: hashPassword,
      bio,
    });

    const token = generateToken(newUser._id);

    res.json({
      success: true,
      userData: newUser,
      token,
      message: " Account created susscessfully",
    });
  } catch (error) {
    console.log(error.message)
    res.json({
        success: false ,
        message : error.message
    })
  }
};

//controller to login user

export const login = async (req , res )=> {
    try{
       const { email, password } = req.body;
       const userData = await User.findOne({email})

       const isPasswordCorrect = await bcrypt.compare(password , userData.password);

       if(!isPasswordCorrect){
        return res.json({
            success : false,
            message : " Invaild password"
        })
       }
    const token = generateToken(userData._id);

    res.json({
      success: true,
      userData,
      token,
      message: " Login Successfull",
    });

    }catch (error) {
    console.log(error.message)
    res.json({
        success: false ,
        message : error.message
    })
  }
}

// controller to check if user is authenthicated

export const checkAuth = (req , res)=>{
  res.json({
    success : true,
    user : req.user
  });
}

//controller to upadte profile details

// export const updateProfile = async (req , res )=>{
//   try {
//     const {profilePic , bio , fullName} = req.body;

//     const userId = req.user._id;

//     let updatedUser;

//     if(!profilePic){
//       updatedUser = await User.findByIdAndUpdate(userId , { bio , fullName} , {new : true});
//         }
//       else{
//         const upload = await cloudinary.uploader.upload(profilePic);

//         updatedUser = await User.findByIdAndUpdate(userId , { profilePic : upload.secure_url , bio , fullName} ,{new : true})
//       }  

//       res.json({success: true , user : updatedUser})
//   } catch (error) {
//     console.log(error.message)
//     res.json({success: false , message : error.message})
//   }
// }



export const updateProfile = async (req, res) => {
  try {
    const { profilePic, bio, fullName } = req.body;
    const userId = req.user._id;

    let updatedUser;

    if (profilePic) {
      // Cloudinary upload with base64
      try {
        const uploadResponse = await cloudinary.uploader.upload(profilePic, {
          folder: "profiles", // optional folder
        });

        updatedUser = await User.findByIdAndUpdate(
          userId,
          {
            profilePic: uploadResponse.secure_url,
            bio,
            fullName,
          },
          { new: true }
        );
      } catch (err) {
        console.log("Cloudinary upload error:", err.message);
        return res
          .status(500)
          .json({ success: false, message: "Image upload failed" });
      }
    } else {
      // If no image, update only name & bio
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { bio, fullName },
        { new: true }
      );
    }

    return res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.log("Profile update error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};