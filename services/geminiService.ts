import { GoogleGenAI, Type } from "@google/genai";
import type { Bill, BillAnalysis, ChatMessage, MediaItem, DebateSegment } from '../types';
import { MOCK_USER_NAMES } from "../constants";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    simplifiedExplanation: {
      type: Type.STRING,
      description: "A very simple, easy-to-understand explanation of the bill, suitable for a 10th-grade student."
    },
    viewpoints: {
      type: Type.OBJECT,
      description: "Three distinct viewpoints on the bill: one strongly in favor (pro), one strongly against (con), and one neutral.",
      properties: {
          pro: { type: Type.STRING, description: "A strong argument in favor of the bill." },
          con: { type: Type.STRING, description: "A strong argument against the bill." },
          neutral: { type: Type.STRING, description: "A balanced, neutral analysis of the bill's implications." }
      },
      required: ["pro", "con", "neutral"]
    },
    impactData: {
        type: Type.ARRAY,
        description: "A list of 3-5 data points showing the potential impact of the bill on different sectors (e.g., Economy, Environment, Social).",
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: "Name of the sector or area of impact." },
                'If Passed': { type: Type.NUMBER, description: "A score from -100 to 100 representing positive or negative impact if passed." },
                'If Not Passed': { type: Type.NUMBER, description: "A score from -100 to 100 representing impact if not passed." }
            },
            required: ["name", "If Passed", "If Not Passed"]
        }
    },
    parliamentaryDebate: {
      type: Type.ARRAY,
      description: "A summary of real parliamentary debates on this bill, citing 3-4 key speakers if possible.",
      items: {
        type: Type.OBJECT,
        properties: {
          speaker: { type: Type.STRING, description: "Name of the speaker (e.g., 'Hon. Member A')." },
          party: { type: Type.STRING, description: "Party of the speaker (e.g., 'Ruling Party', 'Opposition')." },
          statement: { type: Type.STRING, description: "A key quote or summary of their argument, based on real debates." }
        },
        required: ["speaker", "party", "statement"]
      }
    },
    media: {
      type: Type.ARRAY,
      description: "A list of 3-5 real media items (videos, news articles) related to the bill. Provide real, verifiable URLs for news articles.",
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, description: "Type of media: 'Video', 'Audio', or 'News'." },
          title: { type: Type.STRING, description: "Title of the media item." },
          description: { type: Type.STRING, description: "A brief, one-sentence description." },
          uri: { type: Type.STRING, description: "A real, verifiable news source URL if the type is 'News'." }
        },
        required: ["type", "title", "description"]
      }
    },
    flashcards: {
        type: Type.ARRAY,
        description: "A list of 3-5 flashcards with a question and a concise answer about the bill.",
        items: {
            type: Type.OBJECT,
            properties: {
                question: { type: Type.STRING, description: "A key question about the bill." },
                answer: { type: Type.STRING, description: "A clear, concise answer to the question." }
            },
            required: ["question", "answer"]
        }
    },
    mindMap: {
        type: Type.OBJECT,
        description: "A mind map structure of the bill's key components.",
        properties: {
            centralTopic: { type: Type.STRING, description: "The core idea or title of the bill." },
            branches: {
                type: Type.ARRAY,
                description: "The main branches off the central topic.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: "Title of the main branch." },
                        children: {
                            type: Type.ARRAY,
                            description: "Sub-points for this branch.",
                            items: { type: Type.STRING }
                        }
                    },
                    required: ["title"]
                }
            }
        },
        required: ["centralTopic", "branches"]
    }
  },
  required: ["simplifiedExplanation", "viewpoints", "impactData", "parliamentaryDebate", "media", "flashcards", "mindMap"]
};

/**
 * Cleans a string that may contain markdown code fences and parses it as JSON.
 * @param text The raw string response from the model.
 * @returns The parsed JSON object.
 */
const cleanAndParseJson = (text: string): any => {
    const trimmedText = text.trim();
    const match = trimmedText.match(/```json\s*([\s\S]*?)\s*```/);
    const jsonString = match ? match[1] : trimmedText;
    
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Failed to parse JSON string:", jsonString);
        throw new Error("Invalid JSON response from model.");
    }
};

export const getBillAnalysis = async (billTitle: string, language: string): Promise<BillAnalysis> => {
  try {
    const analysisPrompt = `Analyze the Indian government bill titled "${billTitle}". Provide real-world, factual information. Generate a simplified explanation, diverse viewpoints (pro, con, neutral), potential impact data, a summary of real parliamentary debates, a list of real media content with URLs, interactive flashcards, and a mind map of the bill's structure.`;

    const analysisResult = await ai.models.generateContent({
      model,
      contents: analysisPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: analysisSchema
      }
    });
    // For now, we are not translating. The logic can be re-added if needed.
    return cleanAndParseJson(analysisResult.text) as BillAnalysis;

  } catch (error) {
    console.error("Error in getBillAnalysis:", error);
    throw new Error("Failed to generate bill analysis using Gemini API.");
  }
};

export const findBillsFromSearch = async (query: string): Promise<Bill[]> => {
    try {
      const prompt = `
        Based on the latest web search results, find recent Indian government policies or bills related to "${query}".
        Return the findings as a JSON array of objects.
        For each bill, provide a realistic but simulated 'voteCount' object with 'for' and 'against' numbers.
        Each object should represent a bill and have the following structure:
        {
          "id": "a-unique-string-identifier-you-generate",
          "title": "The official title of the bill or policy",
          "summary": "A concise, one-sentence summary.",
          "category": "A relevant category like 'Technology', 'Economy', 'Environment', etc.",
          "status": "'Passed', 'In Process', 'Appealed', or 'Announced'. Based on the latest info.",
          "date": "The most relevant date (e.g., passed, introduced, or announced date) in 'Month Day, Year' format (e.g., 'Aug 11, 2023').",
          "voteCount": {
            "for": "A realistic but simulated number of 'for' votes.",
            "against": "A realistic but simulated number of 'against' votes."
          }
        }
        Do not include any other fields. If no bills are found, return an empty array [].
        Your response should only contain the JSON array, with no other text or markdown formatting.
      `;
  
      const result = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
              tools: [{ googleSearch: {} }],
          },
      });
  
      const bills = cleanAndParseJson(result.text) as Bill[];
      
      // Ensure vote counts are numbers
      return bills.map(bill => ({
        ...bill,
        voteCount: {
            for: Number(bill.voteCount.for) || 0,
            against: Number(bill.voteCount.against) || 0
        }
      }));
  
    } catch (error) {
      console.error("Error in findBillsFromSearch:", error);
      throw new Error("Failed to perform web search for bills using Gemini API.");
    }
};

export const getAiChatResponse = async (thread: ChatMessage[], billTitle: string): Promise<ChatMessage[]> => {
    const conversationHistory = thread.map(m => `${m.name}: ${m.text}`).join('\n');
    const availableNames = MOCK_USER_NAMES.filter(name => !thread.some(msg => msg.name === name));

    const prompt = `
    This is a discussion forum about the Indian bill: "${billTitle}".
    Conversation so far:
    ${conversationHistory}
    
    The last message was from "${thread[thread.length - 1].name}".
    Generate the next 2-3 replies to continue the conversation naturally.
    - Use a mix of English and Romanized Hindi (Hinglish).
    - Keep replies short, conversational, and opinionated.
    - Assign each reply to a random name from this list of available speakers: [${availableNames.join(", ")}]. Do not use a name more than once.
    - Return a JSON array of objects, where each object has "name" and "text".
    `;

    try {
        const result = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "Name of the speaker." },
                    text: { type: Type.STRING, description: "The reply text in Hinglish." },
                  },
                  required: ['name', 'text'],
                }
              },
            },
        });
        const replies: {name: string, text: string}[] = cleanAndParseJson(result.text);

        return replies.map((reply, index) => ({
            id: Date.now() + index + 1,
            author: 'ai',
            ...reply,
        }));

    } catch(error) {
        console.error("Error getting AI chat response:", error);
        return [{
            id: Date.now() + 1,
            name: "Admin",
            author: 'ai',
            text: "Sorry, could not generate a response. Please try again."
        }];
    }
}