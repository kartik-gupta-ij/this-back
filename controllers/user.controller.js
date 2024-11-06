import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';
import bcryptjs from 'bcryptjs';
import { error } from 'console';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export const test = (req, res) => {
  res.json({
    message: 'API is working!',
  });
};

// update user

export const updateUser = async (req, res, next) => {
  const { id } = req.params;
  const { id: userId } = req.user;
  console.log("id", id);
  console.log("userId", userId);
  const {
    name, email, country, age, gender,
    dateOfBirth, dateOfAnniversary, image, marital, points
  } = req.body;

  if (userId !== id) {
    return next(errorHandler(401, 'You can update only your account!'));
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          name,
          email,
          country,
          age,
          gender,
          dateOfBirth,
          dateOfAnniversary,
          image,
          marital,
          points
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return next(errorHandler(404, 'User not found!'));
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    next(errorHandler(500, 'Something went wrong', error));
  }
};


// delete user


export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(401, 'You can delete only your account!'));
  }
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json('User has been deleted...');
  } catch (error) {
    next(error);
  }

}

export const getAllUnderMaster = async (req, res) => {
  try {
    const MasterId = req.params.MasterId; 
    console.log("MasterId:", MasterId);
    
    const users = await Master.find({ userId: MasterId }).populate('subusers');
    console.log("Users with subusers:", users); // Logging the users with subusers

    // Collect all subusers from all users
    const allSubusers = users.flatMap(user => user.subusers);

    return res.status(200).json({
      data: allSubusers
    });
  } catch (error) {
    return res.status(500).json({
      error: "An error occurred while fetching users",
      details: error.message
    });
  }
}




export const getAllUser = async (req, res) => {
  // console.log("working");
  try {
    // const user = await User.find({ role: { $in: ['user', 'master'] } });
    const user = await User.find({ role: { $in: ['user', 'master'] } });

    // console.log("call aaya tha")
    res.status(200).json({ data: user, status: "success" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}

export const getRecentBirthdays = async (req, res) => {
  try {
    const today = new Date();
    const currentYear = today.getFullYear();

    // Get all users
    const users = await User.find({});

    // Calculate the next birthday for each user
    users.forEach(user => {
      const dob = new Date(user.dob);
      const nextBirthday = new Date(currentYear, dob.getMonth(), dob.getDate());

      if (nextBirthday < today) {
        nextBirthday.setFullYear(currentYear + 1);
      }

      user.nextBirthday = nextBirthday;
    });

    // Sort users by next birthday
    users.sort((a, b) => a.nextBirthday - b.nextBirthday);

    // Get the two users with the closest upcoming birthdays
    const recentBirthdays = users.slice(0, 2);

    res.status(200).json(recentBirthdays);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};




export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate OTP
    const otp = crypto.randomBytes(3).toString('hex');
    const otpExpires = Date.now() + 3600000; // 1 hour

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'rock88334@gmail.com',
        pass: 'mrwdwgjdguceirfv'
      }
    });

    const mailOptions = {
      from: 'rock88334@gmail.com',
      to: user.email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is ${otp}`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};



export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  console.log(`Email: ${email}, OTP: ${otp}`); // Log inputs

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log('User not found'); // Log user not found
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.otp !== otp) {
      console.log('Invalid OTP'); // Log invalid OTP
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // OTP is verified
    // user.otp = null; // Clear the OTP after successful verification
    await user.save();

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};



export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  // Validate input
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'Email, OTP, and new password are required' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Reset password
    user.password = await bcryptjs.hash(newPassword, 10);
    user.otp = undefined; // Clear the OTP
    user.otpExpires = undefined; // Clear the OTP expiration
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error(error);
  }
};
export const userStatus = async (req, res) => {
  const { userId } = req.params;
  const { adminId } = req.body;
  console.log("UserStatus");
  // console.log(userId, adminId);

  try {
    // Fetch the admin user based on the adminId from the request body
    const admin = await User.findById(adminId);
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({ message: "Successfully Status into Deactived", "userDat": user });

  } catch (error) {
    console.error("Error converting user to master:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
}
export const userToMaster = async (req, res) => {
  const { userId } = req.params;
  const { adminId } = req.body;
  console.log("UserToMaster");
  console.log(userId, adminId);

  try {
    // Fetch the admin user based on the adminId from the request body
    const admin = await User.findById(adminId);
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (admin.role !== "admin") {
      return res.status(403).json({ message: "You are not authorized to convert to master" });
    }

    user.role = "master";
    await user.save();

    console.log(user.role);

    res.status(200).json({ message: "Successfully converted to Master role" });

  } catch (error) {
    console.error("Error converting user to master:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};



export const addUsersToMaster = async (req, res) => {
  const { userId } = req.params;
  const list = req.body.subuserIds; // Assuming this is an array of subuser IDs
  const masterId = req.body.selectedIds; // Assuming this is a single master user ID
  console.log("userId userId", userId, masterId);

  try {
    const admin = await User.findById(userId);

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "You are not authorized to convert to master" });
    }

    const user = await User.findById(masterId);
    console.log("user -->", user);
    if (user.role !== 'master') {
      return res.status(404).json({ message: "Only Master user can add members" });
    }
    console.log("Aaaya tha");
    console.log("masterId", masterId);
    console.log("Aaaya tha");

    const masterUser = await Master.findOne({ userId: masterId });

    if (!masterUser) {
      return res.status(404).json({ message: "Master user not found" });
    }

    console.log("masterUser", masterUser);

    masterUser.subusers.push(...list);

    // Save the updated document
    await masterUser.save();

    console.log('Subusers added successfully:', masterUser);

    res.status(200).json(masterUser);
  } catch (error) {
    console.error("Error adding users to master:", error);
    res.status(500).json({ message: "Server error" });
  }
};




export const updateRoleToAdmin = async () => {
  try {
    const user = await User.findOneAndUpdate(
      { email: 'rocky@gmail.com' }, // Find the user by email
      { role: 'admin' }, // Update the role to 'admin'
      { new: true } // Return the updated document
    );

    if (!user) {
      console.log('User not found');
    } else {
      console.log('User role updated successfully:', user);
    }
  } catch (error) {
    console.error('Error updating user role:', error);
  }
};


export const getMasterData = async (req, res) => {
  const { masterId } = req.params;
  try {
    const master = await Master.findById(masterId)
      // .populate('userId') // Populate userId
      .populate('subusers'); // Populate subusers

    if (!master) {
      return res.status(404).json({ message: "Master not found" });
    }

    res.status(200).json({ data: master, status: "success" });
  } catch (error) {
    console.error('Error fetching master data:', error);
    res.status(500).json({ message: "Server error" });
  }
};






