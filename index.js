const express = require('express');
require("dotenv").config();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 8000;
const DB_URI = process.env.DB_URI;
mongoose.set('strictQuery', true)
app.get("/", (req, res) => { res.json("Hello Can-app !! TESTING DB Updated") });
mongoose.connect(process.env.DB_URI).then(() => { console.log("Db conneted succesfully"); }).catch((err) => { console.log(err); });
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json());
require("./routes/userRoutes")(app);


// const routes = require('./routes/userRoutes');
// const professionRoutes = require('./routes/professionRoutes');
// const chooseProfessionRoutes = require('./routes/chooseProfessionRoutes');
// const profileRoutes = require('./routes/profileRoutes');
// const pageRoutes = require('./routes/pageRoutes');
// const resumeRoutes = require('./routes/resumeRoutes');
// const callRoutes = require('./routes/callRoutes');
// const websiteRoutes = require('./routes/websiteRoutes');
// const youtubeRoutes = require('./routes/youtubeRoutes');
// const brochureRoutes = require('./routes/brochureRoutes');
// const introductionRoutes = require('./routes/introductionRoutes');
// const instagramRoutes = require('./routes/instagramRoutes');
// const appointmentRoutes = require('./routes/appointmentRoutes');
// const galleryRoutes = require('./routes/galleryRoutes');
// const categoryRoutes = require('./routes/categoryRoutes');
// const postRoutes = require('./routes/postRoutes');
// const experienceRoutes = require('./routes/experienceRoutes');
// const visionRoutes = require('./routes/visionRoutes');
// app.use('/user', routes);
// app.use('/profession', professionRoutes);
// app.use('/chooseProfession', chooseProfessionRoutes);
// app.use('/profile', profileRoutes);
// app.use('/page', pageRoutes);
// app.use('/resume', resumeRoutes);
// app.use('/call', callRoutes);
// app.use('/website', websiteRoutes);
// app.use('/youtube', youtubeRoutes);
// app.use('/brochure', brochureRoutes);
// app.use('/introduction', introductionRoutes);
// app.use('/instagram', instagramRoutes);
// app.use('/appointment', appointmentRoutes);
// app.use('/gallery', galleryRoutes);
// app.use('/category', categoryRoutes);
// app.use('/post', postRoutes);
// app.use('/experience', experienceRoutes);
// app.use('/vision', visionRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});