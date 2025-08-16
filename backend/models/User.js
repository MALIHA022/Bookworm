const mongoose = require('mongoose'); 
const bcrypt = require('bcryptjs');    

const { Schema } = mongoose;

const userSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: { type: String, enum: ['Male', 'Female'], required: true },
    dob: { type: Date, required: true },
    favorites: [{ type: Schema.Types.ObjectId, ref: 'Book' }],
});

// Hash password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    console.log("Comparing passwords...");
    return bcrypt.compare(candidatePassword, this.password);  // Compare with the stored hashed password
};


// Export the model
module.exports = mongoose.model('User', userSchema);
