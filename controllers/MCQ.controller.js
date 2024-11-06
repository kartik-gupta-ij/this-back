import MCQ from "../models/MCQ.model.js";
import User from "../models/user.model.js";

export const createMCQ = async (req, res) => {
  const { MCQs } = req.body;

  if (!Array.isArray(MCQs) || MCQs.length === 0) {
    return res.status(400).json({ message: "Invalid input. 'MCQs' should be a non-empty array." });
  }

  try {
    const createdMCQs = await MCQ.insertMany(MCQs);
    res.status(201).json({ message: "MCQs created successfully", data: createdMCQs });
  } catch (error) {
    console.error('Error creating MCQs:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: "Validation error", details: error.message });
    }
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getAllMCQ = async (req, res) => {
  try {
    const allmcq = await MCQ.find({});
    res.status(200).json({ data: allmcq, status: "success" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateMCQs = async (req, res) => {
  const { questions } = req.body;
  console.log("req.body",req.body)

  try {
    const updatePromises = questions.map(question => 
      MCQ.findByIdAndUpdate(question._id, question, { new: true })
    );

    const updatedMCQs = await Promise.all(updatePromises);
    res.status(200).json({ message: "MCQs updated successfully", data: updatedMCQs });
  } catch (error) {
    console.error('Error updating MCQs:', error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const submitMCQHandler = async (req, res) => {
  const { points } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.points = points;
    user.isTestGiven = true;
    await user.save();

    return res.status(200).json({ message: "Points updated successfully", user });
  } catch (error) {
    console.error("Error updating points:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
