import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fetchQuestions() {
    const { data, error } = await supabase
        .from('questions')
        .select('*, categories(name, color)'); // Fetch questions with their category name and color

    if (error) {
        throw new Error(`Error fetching questions: ${error.message}`);
    }
    return data;
}

async function fetchCategories() {
    const { data, error } = await supabase
        .from('categories')
        .select('*');

    if (error) {
        throw new Error(`Error fetching categories: ${error.message}`);
    }
    return data;
}

function saveToFile(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST requests allowed', statusCode: 405 });
    }

    try {
        // Fetch questions and categories
        const questionsData = await fetchQuestions();
        const categoriesData = await fetchCategories();

        // Transform questions into the required format
        const questionsByCategory = {};

        // Organize questions by category name
        questionsData.forEach(question => {
            const categoryName = question.categories.name;

            if (!questionsByCategory[categoryName]) {
                questionsByCategory[categoryName] = [];
            }

            questionsByCategory[categoryName].push({
                question: question.question,
                answers: question.answers,
                correctAnswer: question.correct_answer
            });
        });

        // Save categories and questions to files
        const categoriesFilePath = path.join(process.cwd(), 'src/assets/categories.json');
        saveToFile(categoriesFilePath, categoriesData);

        const questionsFilePath = path.join(process.cwd(), 'src/assets/questions.json');
        saveToFile(questionsFilePath, questionsByCategory);

        // Respond with success message
        res.status(200).json({ message: 'Data updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message, statusCode: 500 });
    }
}