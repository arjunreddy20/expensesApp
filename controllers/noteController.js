const Note = require('../models/noteModel');

const NoteController = {
    getNotes: async (req, res) => {
        try {
            const notes = await Note.findAll({
                where: { userId: req.userId },
                order: [['date', 'ASC']]
            });
            res.status(200).json(notes);
        } catch (err) {
            console.error('Error fetching notes:', err);
            res.status(500).json({ message: 'Error fetching notes' });
        }
    },
    
    addNote: async (req, res) => {
        try {
            const { note, date } = req.body;
            const newNote = await Note.create({
                userId: req.userId,
                date,
                note
            });
            res.status(201).json(newNote);
        } catch (err) {
            console.error('Error adding note:', err);
            res.status(500).json({ message: 'Error adding note' });
        }
    }
};

module.exports = NoteController;