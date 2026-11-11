import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },

    paid_by: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    }, 

    owed_by: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },

    amount: {
        type: Number,
        required: true,
        min: 0.01, 
        validate: {
            validator: value => Number.isFinite(value) && 
                Math.round(value * 100) === value * 100,
            message: 'Amount must have no more than two decimal places.'
        }
    },

    date: {
        type: Date,
        required: true
    }, 

    is_paid: {
        type: Boolean,
        required: true,
        default: false
    } 
}, { 
    collection: 'expenses',
    timestamps: true, 
    autoIndex: false 
}); 

export const Expense = 
mongoose.models.Expense || mongoose.model('Expense', expenseSchema);