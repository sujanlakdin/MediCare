// In-memory / MongoDB Caregiver Notes Store
let caregiverNotes = [
  {
    id: 'note-1',
    patientId: 'p-1',
    title: 'Afternoon BP & Pulse Check',
    category: 'Vitals',
    content: 'Blood Pressure: 122/80 mmHg, Pulse: 72 bpm. Patient in good spirits after evening walk.',
    createdAt: new Date().toISOString(),
    author: 'Caregiver Sarah',
  },
  {
    id: 'note-2',
    patientId: 'p-1',
    title: 'Dr. Patel Consultation Update',
    category: 'Doctor Visit',
    content: 'Doctor advised continuing Lisinopril 10mg. Next follow-up scheduled in 2 weeks.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    author: 'Caregiver Sarah',
  },
];

exports.getNotes = async (req, res) => {
  try {
    const { patientId } = req.query;
    const filtered = patientId
      ? caregiverNotes.filter((n) => n.patientId === patientId)
      : caregiverNotes;
    res.status(200).json(filtered);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch caregiver notes' });
  }
};

exports.addNote = async (req, res) => {
  try {
    const { patientId, title, category, content, author } = req.body;
    const newNote = {
      id: `note-${Date.now()}`,
      patientId: patientId || 'p-1',
      title: title || 'Care Note',
      category: category || 'General',
      content: content || '',
      createdAt: new Date().toISOString(),
      author: author || 'Caregiver',
    };
    caregiverNotes.unshift(newNote);
    res.status(201).json({ message: 'Note created successfully', data: newNote });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create caregiver note' });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, content } = req.body;
    caregiverNotes = caregiverNotes.map((n) =>
      n.id === id ? { ...n, title: title || n.title, category: category || n.category, content: content || n.content } : n
    );
    const updated = caregiverNotes.find((n) => n.id === id);
    res.status(200).json({ message: 'Note updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update caregiver note' });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    caregiverNotes = caregiverNotes.filter((n) => n.id !== id);
    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete caregiver note' });
  }
};
