const express = require('express');
const UserController = require('../controllers/userController');
const ExpenseController = require('../controllers/expenseController');
const NoteController = require('../controllers/noteController');
const userAuthentication = require('../middleware/userAuthentication');
const FileUrl = require('../models/fileUrlModel');

const router = express.Router();


router.get('/user-details', userAuthentication, UserController.getUserDetails);
router.get('/expenses/monthly', userAuthentication, ExpenseController.getMonthlyExpenses);
router.get('/expenses/yearly', userAuthentication, ExpenseController.getYearlyExpenses);
router.get('/notes', userAuthentication, NoteController.getNotes);
router.post('/notes', userAuthentication, NoteController.addNote);
router.get('/expenses/download', userAuthentication, ExpenseController.downloadExpenses);
router.post('/expenses', userAuthentication, ExpenseController.addExpense);
router.get('/expenses/all-monthly', userAuthentication, ExpenseController.getAllMonthlyExpenses);
router.delete('/expenses/monthly/:id', userAuthentication, ExpenseController.deleteExpense);
router.get('/expenses/download-urls', userAuthentication, async (req, res) => {
    try {
        const fileUrls = await FileUrl.findAll({
            where: { user_id: req.userId },
            order: [['download_date', 'DESC']]
        });
        res.status(200).json(fileUrls);
    } catch (err) {
        console.error('Error fetching download URLs:', err);
        res.status(500).json({ message: 'Error fetching download URLs' });
    }
});

module.exports = router;