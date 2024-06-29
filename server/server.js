const express = require('express');
const mongoose = require("mongoose");
const cors = require('cors');
const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");
const jwt = require('jsonwebtoken');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const User = require('./models/userModel');
const Diagnosis = require('./models/diagnosisModel');
const {protect} = require("./middleware/authMiddleware");
const dotenv = require('dotenv')
const env = dotenv.config({ path: path.resolve(__dirname, '../.env') })



const app = express();
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Define the destination folder for uploaded files
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Define how the file will be named
    }
});

const upload = multer({storage: storage});


// Use CORS middleware
app.use(cors({
    origin: ['http://localhost:3000', "http://localhost:8000"]
}));
app.use(express.json({limit: '10mb'}));

const connectDB = asyncHandler(async () => {
        try {
            await mongoose.connect("mongodb://127.0.0.1:27017/project3");
            console.log("database successfully connected");
        } catch (e) {
            console.log(e)
        }
    }
);
connectDB();

app.get("/", asyncHandler(async (req, res) => {
    res.json({
        "body": "hello"
    })
}));

app.post('/Signup', asyncHandler(async (req, res) => {
    const {name, email, password, profilePicture} = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            picture: profilePicture ? profilePicture : undefined,
        });
        await newUser.save();
        const token = jwt.sign({id: newUser._id}, 'spiderman', {expiresIn: '1d'});

        res.status(200).json({
            token: token,
        });
        console.log("registered")
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}));


app.post('/login', asyncHandler(async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email});

        if (user) {
            const passwordMatch = await user.matchPassword(password);

            if (passwordMatch) {
                res.status(200).json({
                    token: jwt.sign({id: user._id}, 'spiderman', {expiresIn: '1d'})
                });
            } else {
                res.status(401).json({error: "Invalid password"});
            }
        } else {
            res.status(401).json({error: "Invalid id or password"});
        }
    } catch (error) {
        console.error("Error occurred:", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}));


app.post('/verify-token', asyncHandler(async (req, res) => {
    const {token} = req.body;

    jwt.verify(token, "spiderman", async (err, decoded) => {
        if (err) {
            return res.status(401).json({message: 'Invalid token'});
        }

        const user_id = decoded.id;
        const user = await User.findOne({_id: user_id}); // Corrected query

        if (!user) {
            console.log("User not found");
            return res.status(401).json({message: 'User not found'});
        }
        // Respond with user information
        res.status(200).json(user);
    });
}));


app.post('/injury', protect, asyncHandler(async (req, res) => {
    let tempFilePath; // Declare tempFilePath variable here

    try {
        const injuryBase64 = req.body.data; // Assuming the base64 string is sent in the 'data' field

        // Convert the base64 string to a buffer
        const injuryBuffer = Buffer.from(injuryBase64, 'base64');

        // Write the buffer to a temporary file
        tempFilePath = 'temp_image.jpg'; // Choose a suitable file name and extension
        fs.writeFileSync(tempFilePath, injuryBuffer);

        // Create a FormData object to send the file
        const formData = new FormData();
        formData.append('image', fs.createReadStream(tempFilePath));

        // Make a POST request to the FastAPI endpoint
        const response = await axios.post('http://localhost:8000/process_image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        console.log('Response from FastAPI server:', response.data);


        // Clean up the temporary file
        fs.unlinkSync(tempFilePath);

        // Store the diagnosis in the database
        const diagnosis = new Diagnosis({
            response: response.data,
            type: 'injury',
            base64String: injuryBase64
        });
        await diagnosis.save();

        // Get the user ID from the request
        const userId = req.user._id;

        // Update the user document to store the diagnosis ID
        await User.findByIdAndUpdate(userId, {$push: {diagnosisIds: diagnosis._id}});

        // Handle the response from the FastAPI server as needed
        res.status(200).json({message: 'Injury diagnosis saved successfully', diagnosisId: diagnosis._id});
    } catch (error) {
        console.error('Error sending base64 string to FastAPI server:', error);

        // Clean up the temporary file in case of an error
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }

        res.status(500).send('Error sending base64 string to FastAPI server');
    }
}));

// Route to handle file uploads for the report purpose
app.post('/report', protect, upload.single('file'), asyncHandler(async (req, res) => {
    let pdfFilePath; // Variable to store the path of the PDF file

    try {
        // Get the path of the uploaded PDF file
        pdfFilePath = path.join(__dirname, 'uploads/', req.file.filename);

        // Create a FormData object to send the file
        const formData = new FormData();
        formData.append('pdf_file', fs.createReadStream(pdfFilePath), {filename: req.file.originalname});

        // Make a POST request to the '/upload-pdf' route using Axios
        const response = await axios.post('http://localhost:8000/upload-pdf', formData, {
            headers: {
                ...formData.getHeaders() // Include multipart/form-data headers
            }
        });


        const question = new FormData();
        question.append('user_question', "Give a detailed summary");
        let reply = ""; // Initialize reply variable

        try {
            const conclusion = await axios.post('http://localhost:8000/ask-question', question, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (conclusion.data.Reply !== null) {
                reply = conclusion.data.Reply;
            }
        } catch (error) {
            console.error('Error asking question:', error);
            // Handle errors if necessary
        }

        const formData2 = new FormData();
        formData2.append('text', reply);

        const detailedresponse = await axios.post('http://localhost:8000/remedies_reply', formData2, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });


        // Save the diagnosis in the database
        const diagnosis = new Diagnosis({
            response: detailedresponse.data,
            type: 'report'
        });
        const savedDiagnosis = await diagnosis.save();


        // Get the user ID from the request
        const userId = req.user._id;

        // Update the user document to store the diagnosis ID
        await User.findByIdAndUpdate(userId, {$push: {diagnosisIds: diagnosis._id}});

        console.log("pdf report saved");

        // Send a success response to the client along with the diagnosis ID
        res.status(200).json({
            message: 'PDF file uploaded successfully for report purpose',
            diagnosisId: savedDiagnosis._id
        });
    } catch (error) {
        console.error('Error uploading PDF file:', error);
        // Send an error response to the client
        res.status(500).send('Error uploading PDF file');
    } finally {
        // Delete the uploaded PDF file regardless of success or error
        if (pdfFilePath && fs.existsSync(pdfFilePath)) {
            fs.unlinkSync(pdfFilePath);
        }
    }
}));


app.post('/xray', protect, asyncHandler(async (req, res) => {
    let tempFilePath;
    try {
        const xrayBase64 = req.body.data; // Assuming the base64 string is sent in the 'data' field

        // Convert the base64 string to a buffer
        const xrayBuffer = await Buffer.from(xrayBase64, 'base64');

        // Write the buffer to a temporary file
        tempFilePath = 'temp_xray.jpg'; // Choose a suitable file name and extension
        await fs.writeFileSync(tempFilePath, xrayBuffer);

        // Create a FormData object to send the file
        const formData = new FormData();
        formData.append('file', fs.createReadStream(tempFilePath));

        // Make a POST request to the FastAPI endpoint
        const response = await axios.post('http://localhost:8000/predict-chest-xray', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        console.log('Response from FastAPI server:', response.data);

        const formData2 = new FormData();
        formData2.append('text', response.data.class);

        const detailedresponse = await axios.post('http://localhost:8000/remedies_reply', formData2, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        // Clean up the temporary file
        fs.unlinkSync(tempFilePath);

        // Store the diagnosis in the database
        const diagnosis = new Diagnosis({
            response: detailedresponse.data,
            type: 'chest-xray',
            base64String: xrayBase64
        });
        await diagnosis.save();


        // Get the user ID from the request
        const userId = req.user._id;

        // Update the user document to store the diagnosis ID
        await User.findByIdAndUpdate(userId, {$push: {diagnosisIds: diagnosis._id}});

        // Handle the response from the FastAPI server as needed
        res.status(200).json({message: 'Injury diagnosis saved successfully', diagnosisId: diagnosis._id});
    } catch (error) {
        console.error('Error sending base64 string to FastAPI server:', error);

        // Clean up the temporary file in case of an error
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }

        res.status(500).send('Error sending base64 string to FastAPI server');
    }
}));

app.post('/mri', protect, asyncHandler(async (req, res) => {
    let tempFilePath;
    try {
        const mriBase64 = req.body.data; // Assuming the base64 string is sent in the 'data' field

        // Convert the base64 string to a buffer
        const mriBuffer = Buffer.from(mriBase64, 'base64');

        // Write the buffer to a temporary file
        tempFilePath = 'temp_image.jpg'; // Choose a suitable file name and extension
        fs.writeFileSync(tempFilePath, mriBuffer);

        // Create a FormData object to send the file
        const formData = new FormData();
        formData.append('file', fs.createReadStream(tempFilePath));

        // Make a POST request to the FastAPI endpoint
        const response = await axios.post('http://localhost:8000/predict-brain-mri', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });


        const formData2 = new FormData();
        formData2.append('text', response.data.class);

        const detailedresponse = await axios.post('http://localhost:8000/remedies_reply', formData2, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });


        const diagnosis = new Diagnosis({
            response: detailedresponse.data,
            type: 'brain-mri',
            base64String: mriBase64
        });
        await diagnosis.save();

        // Get the user ID from the request
        const userId = req.user._id;

        // Update the user document to store the diagnosis ID
        await User.findByIdAndUpdate(userId, {$push: {diagnosisIds: diagnosis._id}});

        // Clean up the temporary file
        fs.unlinkSync(tempFilePath);

        // Handle the response from the FastAPI server as needed
        res.status(200).json({message: 'Injury diagnosis saved successfully', diagnosisId: diagnosis._id});
    } catch (error) {
        console.error('Error sending base64 string to FastAPI server:', error);

        // Clean up the temporary file in case of an error
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }

        res.status(500).send('Error sending base64 string to FastAPI server');
    }
}));


app.post('/diagnosis', protect, asyncHandler(async (req, res) => {
    try {
        // Extract the diagnosis ID from the request parameters
        const {id} = req.body;

        // Query the database for the diagnosis with the given ID
        const diagnosis = await Diagnosis.findById(id);

        // Check if the diagnosis exists
        if (!diagnosis) {
            return res.status(404).json({message: 'Diagnosis not found'});
        }

        // If the diagnosis exists, send it as a JSON response
        return res.json(diagnosis);
    } catch (error) {
        // If an error occurs during the database operation, send an error response
        console.error('Error fetching diagnosis:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}));

app.delete('/diagnosis/:id', protect, asyncHandler(async (req, res) => {
    try {
        // Extract the diagnosis ID from the request parameters
        const {id} = req.params;

        // Query the database for the diagnosis with the given ID and delete it
        const diagnosis = await Diagnosis.findByIdAndDelete(id);

        // Check if the diagnosis exists
        if (!diagnosis) {
            return res.status(404).json({message: 'Diagnosis not found'});
        }

        // Remove the diagnosis ID from the user's diagnosisIds array
        const user = await User.findOneAndUpdate(
            {diagnosisIds: id},
            {$pull: {diagnosisIds: id}},
            {new: true}
        );

        // If the diagnosis was successfully deleted from the user's list, send a success response
        if (user) {
            return res.json({message: 'Diagnosis deleted successfully'});
        } else {
            // If the diagnosis ID was not found in the user's list, log an error
            console.error('Diagnosis ID not found in user list');
            return res.status(500).json({message: 'Internal server error'});
        }
    } catch (error) {
        // If an error occurs during the database operation, send an error response
        console.error('Error deleting diagnosis:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}));


app.listen(process.env.SERVER_PORT, () => {
    console.log(process.env.SERVER_PORT_URL);
});


