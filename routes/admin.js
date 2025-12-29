const express = require('express');
const router = express.Router();
const Car = require('../models/Car');
const Booking = require('../models/Booking');
const { adminAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir); // agar uploads folder nahi hai to create kar do
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // unique name with extension
  }
});
const upload = multer({ storage });

// Get all bookings
router.get('/bookings', adminAuth, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('car')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add new car with image upload
router.post('/cars', adminAuth, upload.single('imageFile'), async (req, res) => {
  try {
    const car = await Car.create({
      ...req.body,
      image: req.file ? req.file.path : null
    });

    res.status(201).json(car);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add car', error: err.message });
  }
});


// Update car
router.put('/cars/:id',
  adminAuth,
  upload.single('imageFile'),
  async (req, res) => {
    try {
      const updateData = { ...req.body };

      if (req.file) {
        updateData.image = req.file.path;
      }

      const car = await Car.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      res.json(car);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);


// Delete car
router.delete('/cars/:id', adminAuth, async (req, res) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);
    if (!car) return res.status(404).json({ message: 'Car not found' });

    // delete image from server if exists
    if (car.image && fs.existsSync(car.image)) {
      fs.unlinkSync(car.image);
    }

    res.json({ message: 'Car deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update booking status
router.put('/bookings/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('car').populate('user', 'name email');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const Car = require('../models/Car');
// const Booking = require('../models/Booking');
// const { adminAuth } = require('../middleware/auth');

// // const upload = multer({ dest: 'uploads/' });
// const multer = require('multer');
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/');
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + '-' + file.originalname);
//   }
// });
// const upload = multer({ storage });
// // Get all bookings
// router.get('/bookings', adminAuth, async (req, res) => {
//   try {
//     const bookings = await Booking.find()
//       .populate('car')
//       .populate('user', 'name email')
//       .sort({ createdAt: -1 });
//     res.json(bookings);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Add new car
// router.post('/cars', upload.single('image'), async (req, res) => {
//   try {
//     const car = await Car.create({
//       ...req.body,
//       image: req.file ? req.file.path : null
//     });
//     res.status(201).json(car);
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to add car', error: err.message });
//   }
// });

// // Update car
// router.put('/cars/:id', adminAuth, async (req, res) => {
//   try {
//     const car = await Car.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true, runValidators: true }
//     );
//     if (!car) {
//       return res.status(404).json({ message: 'Car not found' });
//     }
//     res.json(car);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Delete car
// router.delete('/cars/:id', adminAuth, async (req, res) => {
//   try {
//     const car = await Car.findByIdAndDelete(req.params.id);
//     if (!car) {
//       return res.status(404).json({ message: 'Car not found' });
//     }
//     res.json({ message: 'Car deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Update booking status
// router.put('/bookings/:id/status', adminAuth, async (req, res) => {
//   try {
//     const { status } = req.body;
//     const booking = await Booking.findByIdAndUpdate(
//       req.params.id,
//       { status },
//       { new: true }
//     ).populate('car').populate('user', 'name email');

//     if (!booking) {
//       return res.status(404).json({ message: 'Booking not found' });
//     }
//     res.json(booking);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// module.exports = router;


// const express = require('express');
// const router = express.Router();
// const Car = require('../models/Car');
// const Booking = require('../models/Booking');
// const { adminAuth } = require('../middleware/auth');
// const multer = require('multer');
// const path = require('path');

// // Multer config for image upload
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/'); // folder to save images
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   }
// });
// const upload = multer({ storage });

// // ======================
// // Get all bookings
// // ======================
// router.get('/bookings', adminAuth, async (req, res) => {
//   try {
//     const bookings = await Booking.find()
//       .populate('car')
//       .populate('user', 'name email')
//       .sort({ createdAt: -1 });
//     res.json(bookings);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // ======================
// // Add new car
// // ======================
// app.post(
//   '/api/admin/cars',
//   upload.single('imageFile'),
//   (req, res) => {
//     console.log(req.body); // 👀 must show all fields
//     console.log(req.file); // 👀 image

//     const car = new Car({
//       ...req.body,
//       image: req.file?.filename || req.body.imageUrl
//     });

//     car.save();
//     res.json({ success: true });
//   }
// );

// console.log(req.body);
// console.log(req.file);


// // ======================
// // Update car
// // ======================
// router.put('/cars/:id', adminAuth, upload.single('image'), async (req, res) => {
//   try {
//     const carData = { ...req.body };
//     if (req.file) {
//       carData.image = req.file.filename; // Update image if new file uploaded
//     }

//     const car = await Car.findByIdAndUpdate(
//       req.params.id,
//       carData,
//       { new: true, runValidators: true }
//     );

//     if (!car) {
//       return res.status(404).json({ message: 'Car not found' });
//     }
//     res.json(car);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // ======================
// // Delete car
// // ======================
// router.delete('/cars/:id', adminAuth, async (req, res) => {
//   try {
//     const car = await Car.findByIdAndDelete(req.params.id);
//     if (!car) {
//       return res.status(404).json({ message: 'Car not found' });
//     }
//     res.json({ message: 'Car deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // ======================
// // Update booking status
// // ======================
// router.put('/bookings/:id/status', adminAuth, async (req, res) => {
//   try {
//     const { status } = req.body;
//     const booking = await Booking.findByIdAndUpdate(
//       req.params.id,
//       { status },
//       { new: true }
//     ).populate('car').populate('user', 'name email');

//     if (!booking) {
//       return res.status(404).json({ message: 'Booking not found' });
//     }
//     res.json(booking);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// module.exports = router;
