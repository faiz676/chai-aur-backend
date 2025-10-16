import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import User from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloundinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
 

const registerUser = asyncHandler( async (req,res) => 
{
       // get data from frontend
       // validation --> not empty
       // check if user already exist - email,username
       // check for images and check for avatar
       // upload to cloudinary
       // create user object - create entry in db
       // remove password and refresh token from response
       // check for user create
       // return res

      const {fullname,email,username} = req.body
      console.log("fullname:",fullname);
      
        if(
            [fullname,email,username,password].some((field)=>
            
            field?.trim() ==="")
        ){
            throw new ApiError(400,"All fields are required")
        }

       const existedUser = User.findOne({
        $or: [{username},{email}]
       })
       if(existedUser){
        throw new ApiError(409,"user with email or username already exist")
       }

       const avatarlocalPath = req.files?.avatar[0]?.path;
       const coverImageLocalPath = req.files?.coverImage[0].path;

       if(!avatarlocalPath){
        throw new ApiError(400,"Avatar file is required")
       }

       const avatar = await uploadOnCloudinary(avatarlocalPath)
        const coverImage = await uploadOnCloudinary(coverImageLocalPath)
        if(!avatar){
            throw new ApiError(400,"Avatar file is required")
        }

        const user = await User.create({
            fullname,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase()
        })

       const createdUser = await User.findById(user._id).select(
        "-password -refereshToken"
       )

       if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
       }

      return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered Successfully")
      )
     })


export {registerUser}
