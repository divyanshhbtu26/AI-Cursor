import axios from 'axios';

async function isOllamaRunning(){
    try {
        await axios.get('http://localhost:11434/api/tags');
        return true;
    } catch (error) {
        return false;
    }
}

async function getOllamaPlan(messages){
    try {
        const latestUserMessage = messages[messages.length - 1]?.text || 'Build a website';
        const prompt = `
        You are a helpful assistant that generates a plan for building a website based on the user's request. The user has provided the following message: "${latestUserMessage}". Please create a step-by-step plan for building a website that fulfills the user's request. The plan should be clear and concise, outlining the necessary steps to achieve the desired outcome.
        Your task:
        1. Understand user request
        2. Make step-by-step execution plan
        3. Mention files/folders needed
        4. Mention UI ideas
        5. Mention features
        6. Mention build order
        Please make the plan in a structured format, such as a numbered list or bullet points, to ensure clarity and ease of understanding.
        Return concise plain text only.
        `;
        const response = await axios.post('http://localhost:11434/api/generate', {
            model: "gemma:2b",
            prompt,
            stream: false
        });
        return response.data.response;
    } catch (error) {
        console.log("Ollama Plan Error:", error.message);
        return null;
    }
}



export { isOllamaRunning, getOllamaPlan };