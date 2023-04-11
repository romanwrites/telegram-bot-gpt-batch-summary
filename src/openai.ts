import {Configuration, OpenAIApi} from "openai";

const configuration = new Configuration({
    organization: process.env.OPENAI_ORGANIZATION as string,
    apiKey: process.env.OPENAI_API_KEY as string,
});
const openai = new OpenAIApi(configuration);

export async function chatCompletion(prompt: string): Promise<string> {
    const batchSize = 2048;
    const summaryPrompts = splitPrompt(prompt, batchSize);

    let summarizedText = '';

    for (const summaryPrompt of summaryPrompts) {
        try {
            console.log('Sending request to OpenAI API... ', summaryPrompt);

            const response = await openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are ChatGPT, a large language model trained by OpenAI. ' +
                            'Please provide a concise, clear, and non-repetitive summary of the following text, ' +
                            'focusing on the most important points and ideas:' +
                            '' },
                    { role: 'user', content: summaryPrompt }
                ],
                max_tokens: 500,
                n: 1,
                temperature: 0.5,
            });

            if (response.data.choices && response.data.choices.length > 0 && response.data.choices[0].message) {
                const content = response.data.choices[0].message.content;
                console.log('API response:', content);

                summarizedText += response.data.choices[0].message.content + ' ';
            } else {
                console.error('API response:', response.data);
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('API error:', error.message);
                throw error;
            } else {
                console.log('An unexpected error occurred');
            }
        }
    }

    return summarizedText;
}

function splitPrompt(prompt: string, batchSize: number): string[] {
    const words = prompt.split(' ');
    const prompts: string[] = [];
    let currentPrompt = '';

    for (const word of words) {
        if ((currentPrompt + ' ' + word).length > batchSize) {
            prompts.push(currentPrompt.trim());
            currentPrompt = '';
        }
        currentPrompt += ' ' + word;
    }

    if (currentPrompt.trim()) {
        prompts.push(currentPrompt.trim());
    }

    return prompts;
}
