import Master from '../models/master.model.js';


export const MasterDetails = async (req, res) => {
    try {
        const master = await Master.find({})
            .populate('userId') // populate userId field
            .populate('subusers'); // populate subusers field

        return res.status(200).json({
            data: master
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Issues"
        });
    }
};

