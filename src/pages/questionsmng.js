import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const QuestionsPage = () => {
    const [categories, setCategories] = useState([]);
    const [questions, setQuestions] = useState({});
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryColor, setNewCategoryColor] = useState('');
    const [newQuestion, setNewQuestion] = useState('');
    const [newAnswers, setNewAnswers] = useState(['', '', '', '']);
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [editingQuestionId, setEditingQuestionId] = useState(null);
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [expandedCategory, setExpandedCategory] = useState(null);

    useEffect(() => {
        loadCategories();
        loadQuestions();
    }, []);

    const loadCategories = async () => {
        try {
            const { data, error } = await supabase.from('categories').select('*');
            if (error) throw error;
            setCategories(data);
        } catch (error) {
            console.error('Error loading categories:', error.message);
        }
    };

    const loadQuestions = async () => {
        try {
            const { data, error } = await supabase.from('questions').select('*');
            if (error) throw error;

            const groupedQuestions = data.reduce((acc, question) => {
                const categoryId = question.category_id;
                if (!acc[categoryId]) acc[categoryId] = [];
                acc[categoryId].push(question);
                return acc;
            }, {});

            setQuestions(groupedQuestions);
        } catch (error) {
            console.error('Error loading questions:', error.message);
        }
    };

    const addCategory = async () => {
        if (newCategoryName.trim() && newCategoryColor.trim()) {
            try {
                const { error } = await supabase
                    .from('categories')
                    .insert([{ name: newCategoryName, color: newCategoryColor }]);
                if (error) throw error;

                loadCategories();
                setNewCategoryName('');
                setNewCategoryColor('');
            } catch (error) {
                console.error('Error adding category:', error.message);
            }
        }
    };

    const deleteCategory = async (categoryId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this category? This action cannot be undone.");
        if (!confirmDelete) return; // Exit if not confirmed

        try {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', categoryId);
            if (error) throw error;

            loadCategories(); // Reload categories
        } catch (error) {
            console.error('Error deleting category:', error.message);
        }
    };

    const editCategory = (category) => {
        setNewCategoryName(category.name);
        setNewCategoryColor(category.color);
        setEditingCategoryId(category.id);
    };

    const updateCategory = async () => {
        if (editingCategoryId) {
            try {
                const { error } = await supabase
                    .from('categories')
                    .update({
                        name: newCategoryName,
                        color: newCategoryColor,
                    })
                    .eq('id', editingCategoryId);
                if (error) throw error;

                loadCategories();
                resetCategoryForm();
            } catch (error) {
                console.error('Error updating category:', error.message);
            }
        }
    };

    const addQuestion = async () => {
        if (newQuestion.trim() && selectedCategoryId && correctAnswer.trim()) {
            try {
                const { error } = await supabase
                    .from('questions')
                    .insert([{
                        category_id: selectedCategoryId,
                        question: newQuestion,
                        answers: newAnswers,
                        correct_answer: correctAnswer,
                    }]);
                if (error) throw error;

                loadQuestions();
                resetQuestionForm();
            } catch (error) {
                console.error('Error adding question:', error.message);
            }
        } else {
            console.warn('Please fill in all fields.');
        }
    };

    const updateQuestion = async () => {
        if (editingQuestionId) {
            try {
                const { error } = await supabase
                    .from('questions')
                    .update({
                        question: newQuestion,
                        answers: newAnswers,
                        correct_answer: correctAnswer,
                        category_id: selectedCategoryId,
                    })
                    .eq('id', editingQuestionId);
                if (error) throw error;

                loadQuestions();
                resetQuestionForm();
            } catch (error) {
                console.error('Error updating question:', error.message);
            }
        }
    };

    const deleteQuestion = async (questionId) => {
        try {
            const { error } = await supabase
                .from('questions')
                .delete()
                .eq('id', questionId);
            if (error) throw error;

            loadQuestions();
        } catch (error) {
            console.error('Error deleting question:', error.message);
        }
    };

    const editQuestion = (question) => {
        setNewQuestion(question.question);
        setNewAnswers(question.answers);
        setCorrectAnswer(question.correct_answer);
        setSelectedCategoryId(question.category_id);
        setEditingQuestionId(question.id);
    };

    const resetQuestionForm = () => {
        setNewQuestion('');
        setNewAnswers(['', '', '', '']);
        setCorrectAnswer('');
        setEditingQuestionId(null);
        setSelectedCategoryId('');
    };

    const resetCategoryForm = () => {
        setNewCategoryName('');
        setNewCategoryColor('');
        setEditingCategoryId(null);
    };

    const toggleCategory = (categoryId) => {
        setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
    };

    return (
        <div className="p-6 bg">
            <h1 className="text-3xl font-bold mb-4">Question Manager</h1>

            {/* Display categories with edit and delete options */}
            <div className="p-4 rounded mb-4 bg-blue-600">
                <h2 className="text-xl font-semibold mb-2 text-cyan-50">Categories ({categories.length})</h2>
                {categories.map((cat) => (
                    <div key={cat.id} className="p-4 rounded mb-4" style={{ backgroundColor: cat.color }}>
                        <h2
                            className="text-xl font-semibold text-white cursor-pointer"
                            onClick={() => toggleCategory(cat.id)}
                        >
                            {cat.name} ({questions[cat.id]?.length || 0}) {expandedCategory === cat.id ? '−' : '+'}
                        </h2>
                        <button
                            className="btn-primary mt-2 mr-2"
                            onClick={() => editCategory(cat)}
                        >
                            Edit Category
                        </button>
                        <button
                            className="btn-danger mt-2 mr-2"
                            onClick={() => deleteCategory(cat.id)}
                        >
                            Delete Category
                        </button>
                        {expandedCategory === cat.id && (
                            
                            <ul className="mt-2">
                                {questions[cat.id]?.map((q) => (
                                    <li key={q.id} className="text-white mb-2">
                                        <strong>{q.question}</strong>
                                        <br />
                                        Answers:{' '}
                                        {q.answers.map((ans, idx) => (
                                            <span
                                                key={idx}
                                                style={{ fontWeight: ans === q.correct_answer ? 'bold' : 'normal' }}
                                            >
                                                {ans}
                                                {idx < q.answers.length - 1 ? ', ' : ''}
                                            </span>
                                        ))}
                                        <div className="mt-1">
                                            <button className="btn-primary mr-2" onClick={() => editQuestion(q)}>
                                                Edit
                                            </button>
                                            <button className="btn-danger" onClick={() => deleteQuestion(q.id)}>
                                                Delete
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>

            {/* Add New Category Section */}
            <div className="p-4 rounded mb-4 bg-sky-200">
                <h2 className="text-xl font-semibold mb-2">Add New Category</h2>
                <label className="block mb-1">Category Name:</label>
                <input
                    className="block w-full mb-2 p-2 border border-gray-300 rounded"
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="New Category Name"
                />
                <label className="block mb-1">Category Color:</label>
                <input
                    className="block w-full mb-2 p-2 border border-gray-300 rounded"
                    type="text"
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                    placeholder="Category Color (e.g., #ff0000)"
                />
                {editingCategoryId ? (
                    <button className="btn-primary mb-4" onClick={updateCategory}>
                        Update Category
                    </button>
                ) : (
                    <button className="btn-primary mb-4" onClick={addCategory}>
                        Add Category
                    </button>
                )}
            </div>

            {/* Add New Question Section */}
            <div className="p-4 rounded mb-4 bg-sky-200">
                <h2 className="text-xl font-semibold mb-2">Add New Question</h2>
                <label className="block mb-1">Select Category:</label>
                <select
                    className="bg-white border border-white rounded p-2 mb-2"
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>

                <label className="block mb-1">New Question:</label>
                <input
                    className="block w-full mb-2 p-2 border border-blue-300 rounded"
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="New Question"
                />
                {newAnswers.map((answer, i) => (
                    <div key={i} className="flex flex-row">
                        <label className="block mb-1">{`${i + 1}:`}</label>
                        <input
                            className="block w-full mb-2 p-2 border border-gray-300 rounded"
                            type="text"
                            value={answer}
                            onChange={(e) => {
                                const updatedAnswers = [...newAnswers];
                                updatedAnswers[i] = e.target.value;
                                setNewAnswers(updatedAnswers);
                            }}
                            placeholder={`Answer Option ${i + 1}`}
                        />
                    </div>
                ))}
                <label className="block mb-1">Correct Answer:</label>
                <select
                    className="ml-2 p-2 border border-gray-300 rounded"
                    value={correctAnswer}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                >
                    {newAnswers.map((ans, index) => (
                        <option key={index} value={ans}>
                            Option {index + 1}: {ans}
                        </option>
                    ))}
                </select>
                <br></br>
                <br></br>

                <button
                    className="btn-primary mb-4"
                    onClick={editingQuestionId ? updateQuestion : addQuestion}
                >
                    {editingQuestionId ? 'Update Question' : 'Add Question'}
                </button>
                {editingQuestionId && (
                    <button className="btn-secondary mb-4 ml-2" onClick={resetQuestionForm}>
                        Cancel Edit
                    </button>
                )}
            </div>

            
        </div>
    );
};

export default QuestionsPage;