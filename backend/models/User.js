const mongoose = require('mongoose'); 
const bcrypt = require('bcryptjs');    

const { Schema } = mongoose;

const userSchema = new Schema({
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    dob: { type: Date, required: true },
    likedPosts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    bookmarks: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    reportedPosts: [{
        post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
        reason: { type: String, required: true },
        reportedAt: { type: Date, default: Date.now }
    }],
    notInterested: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    warnings: [{
        message: String, 
        at: { type: Date, default: Date.now },
        adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        read: { type: Boolean, default: false },
        type: { type: String, enum: ['admin_warning', 'message'], default: 'admin_warning' },
        fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
        postTitle: String,
        postType: String,
        postDescription: String,
        postAuthor: String,
        postPrice: Number,
        isReply: Boolean,
        originalMessage: String,
        conversationId: { type: mongoose.Schema.Types.ObjectId }
    }],
    // Password reset fields
    resetPasswordToken: String,
    resetPasswordExpires: Date,
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

module.exports = mongoose.model('User', userSchema);
