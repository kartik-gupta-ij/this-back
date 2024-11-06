import SadhanaForm from "../models/sadhanaform.model.js";
import { errorHandler } from '../utils/error.js';

// Controller function to create a new SadhanaForm
export const createSadhanaForm = async (req, res, next) => {
  const { chooseOption, points } = req.body;

  try {
    // Verify user exists in request
    if (!req.user) {
      return next(errorHandler(401, 'User not authenticated'));
    }

    // Create a new SadhanaForm document
    const newSadhanaForm = new SadhanaForm({
      chooseOption: chooseOption,
      points: points,
      userId: req.user.id // Using id from cookie token
    });

    // Save the document to the database
    const savedSadhanaForm = await newSadhanaForm.save();

    // Respond with the saved document
    res.status(201).json({
      success: true,
      data: savedSadhanaForm,
    });
  } catch (error) {
    next(error); // Pass error to error handling middleware
  }
};

export const getdatainExcel = async (req, res, next) => {
  const userId = req.params.userId;
  console.log(userId, req.user.role);

  try {
    // Verify user has permission to access this data
    // if (req.user.id !== userId && req.user.role !== 'admin') {
    //   return next(errorHandler(403, 'You can only access your own data'));
    // }

    const data = await SadhanaForm.find({ userId: userId });
    
    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    next(error); // Pass error to error handling middleware
  }
};

// Optional: Add a function to get all forms for the current user
export const getCurrentUserForms = async (req, res, next) => {
  try {
    const data = await SadhanaForm.find({ userId: req.user.id });
    
    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    next(error);
  }
};