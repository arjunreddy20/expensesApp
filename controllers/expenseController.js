const Expense = require('../models/expenseModel');
const User = require('../models/userModel');
const sequelize = require('../db');
const FileUrl = require('../models/fileUrlModel'); // Import the FileUrl model
const s3Service = require('../services/s3Service');
require('dotenv').config(); 


const ExpenseController = {
    getMonthlyExpenses: async (req, res) => {
        const { page = 1, limit = 10 } = req.query; // Get page and limit from query parameters

        try {
            const { count, rows: expenses } = await Expense.findAndCountAll({
                where: { user_id: req.userId },
                attributes: [
                    'id',
                    [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
                    'description',
                    'category',
                    'amount'
                ],
                order: [['created_at', 'ASC']],
                limit: parseInt(limit),
                offset: (page - 1) * limit
            });

            const totalExpenses = await Expense.findAll({
                where: { user_id: req.userId },
                attributes: [
                    [sequelize.fn('SUM', sequelize.col('amount')), 'total_expense']
                ]
            });
            
            const totalPages = Math.ceil(count / limit);

            res.status(200).json({ expenses, totalExpenses: totalExpenses[0].dataValues.total_expense, totalPages, currentPage: parseInt(page) });
        } catch (err) {
            console.error('Error fetching monthly expenses:', err);
            res.status(500).json({ message: 'Error fetching monthly expenses' });
        }
    },
    getAllMonthlyExpenses: async (req, res) => {
        try {
            const expenses = await Expense.findAll({
                where: { user_id: req.userId },
                attributes: [
                    'id',
                    [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
                    'description',
                    'category',
                    'amount'
                ],
                order: [['created_at', 'ASC']]
            });

            const totalExpenses = await Expense.findAll({
                where: { user_id: req.userId },
                attributes: [
                    [sequelize.fn('SUM', sequelize.col('amount')), 'total_expense']
                ]
            });

            res.status(200).json({ expenses, totalExpenses: totalExpenses[0].dataValues.total_expense });
        } catch (err) {
            console.error('Error fetching all monthly expenses:', err);
            res.status(500).json({ message: 'Error fetching all monthly expenses' });
        }
    },
    getYearlyExpenses: async (req, res) => {
        try {
            const expenses = await Expense.findAll({
                where: { user_id: req.userId },
                attributes: [
                    [sequelize.fn('MONTH', sequelize.col('created_at')), 'month'],
                    [sequelize.fn('SUM', sequelize.literal('CASE WHEN category = "salary" THEN amount ELSE 0 END')), 'total_income'],
                    [sequelize.fn('SUM', sequelize.literal('CASE WHEN category != "salary" THEN amount ELSE 0 END')), 'total_expense']
                ],
                group: ['month'],
                order: [['month', 'ASC']]
            });
            res.status(200).json(expenses);
        } catch (err) {
            console.error('Error fetching yearly expenses:', err);
            res.status(500).json({ message: 'Error fetching yearly expenses' });
        }
    },
    downloadExpenses: async (req, res) => {
        try {
            const expenses = await Expense.findAll({
                where: { user_id: req.userId },
                attributes: [
                    [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
                    'description',
                    'category',
                    'amount'
                ],
                order: [['created_at', 'ASC']]
            });
            const fields = ['date', 'description', 'category', 'amount'];
            const { Parser } = require('json2csv');
            const json2csvParser = new Parser({ fields });
            const csv = json2csvParser.parse(expenses);

            // Upload to S3
            const fileContent = Buffer.from(csv, 'utf-8');
            const fileUrl = await s3Service.uploadFile(fileContent, req.userId);

            // Store URL in database
            await FileUrl.create({
                user_id: req.userId,
                file_url: fileUrl
            });
            res.status(200).json({ fileUrl });
        } catch (err) {
            console.error('Error downloading expenses:', err);
            res.status(500).json({ message: 'Error downloading expenses' });
        }
    },
    addExpense: async (req, res) => {
        const { amount, description, category } = req.body;
        const userId = req.userId; // Extracted from token

        const transaction = await sequelize.transaction();

        try {
            const expense = await Expense.create({
                amount,
                description,
                category,
                user_id: userId
            }, { transaction });

            await User.update(
                { total_expenses: sequelize.literal(`total_expenses + ${amount}`) },
                { where: { id: userId }, transaction }
            );

            await transaction.commit();
            res.status(201).json({ message: 'Expense added successfully' });
        } catch (err) {
            await transaction.rollback();
            console.error('Error adding expense:', err);
            res.status(500).json({ message: 'Error adding expense' });
        }
    },
    deleteExpense: async (req, res) => {
        const { id } = req.params;

        const transaction = await sequelize.transaction();

        try {
            console.log(`---------------------${id}----------${req.userId}-----------------`);
            const expense = await Expense.findOne({ where: { id, user_id: req.userId } });

            if (!expense) {
                return res.status(404).json({ message: 'Expense not found' });
            }

            const amount = expense.amount;
            const userId = expense.user_id;

            await Expense.destroy({ where: { id }, transaction });

            await User.update(
                { total_expenses: sequelize.literal(`total_expenses - ${amount}`) },
                { where: { id: userId }, transaction }
            );

            await transaction.commit();
            res.status(200).json({ message: 'Expense deleted successfully' });
        } catch (err) {
            await transaction.rollback();
            console.error('Error deleting expense:', err);
            res.status(500).json({ message: 'Error deleting expense' });
        }
    }
};

module.exports = ExpenseController;