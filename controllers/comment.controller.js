import Comment from '../models/comment.model.js'
import User from '../models/user.model.js';

export const getQuestions = async (req, res) => {
    try {
      const questions = await Comment.find()
        .populate('userId', 'name email image createdAt') // Populate user information for the questions
        .populate('comments.userId', 'name email image createdAt'); // Populate user information for each nested comment
  
      if (!questions || questions.length === 0) {
        return res.status(404).json({ success: false, message: "No questions found" });
      }
  
      return res.status(200).json({ 
        success: true, 
        data: questions 
      });
    } catch (error) {
      console.error('Error fetching questions:', error);
      return res.status(500).json({ success: false, message: "Something went wrong" });
    }
  };


export const createQuestion = async (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: "Title is required" });
  }

  try {
    const question = new Comment({ title, userId: req.user.id, comments: [] });
    const savedQuestion = await question.save();
    
    return res.status(201).json({ 
      success: true, 
      message: "Question created successfully", 
      data: savedQuestion 
    });
  } catch (error) {
    console.error('Error creating question:', error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
}
};

export const createComment = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body; // Corrected to use `text` from req.body

  try {
    // Find the question by its ID
    const question = await Comment.findById(id);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Create a new comment object
    const newComment = { text };

    // Push the new comment object into the comments array of the question
    question.comments.push(newComment);

    // Save the updated question document with the new comment
    await question.save();

    // Respond with a success message and the new comment object
    res.status(200).json({ message: "Comment successfully added", comment: newComment });
  } catch (error) {
    console.error("Error adding comment:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
