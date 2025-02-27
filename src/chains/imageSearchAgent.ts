import {
  RunnableSequence,
  RunnableMap,
  RunnableLambda,
} from '@langchain/core/runnables';
import { PromptTemplate } from '@langchain/core/prompts';
import formatChatHistoryAsString from '../utils/formatHistory';
import { BaseMessage } from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { searchSearxng } from '../lib/searchEngines/searxng';
import { searchGooglePSE } from '../lib/searchEngines/google_pse';
import { getSearchEngineBackend } from '../config';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';

const imageSearchChainPrompt = `
You will be given a conversation below and a follow up question. You need to rephrase the follow-up question so it is a standalone question that can be used by the LLM to search the web for images.
You need to make sure the rephrased question agrees with the conversation and is relevant to the conversation.

Example:
1. Follow up question: What is a cat?
Rephrased: A cat

2. Follow up question: What is a car? How does it works?
Rephrased: Car working

3. Follow up question: How does an AC work?
Rephrased: AC working

Conversation:
{chat_history}

Follow up question: {query}
Rephrased question:
`;

type ImageSearchChainInput = {
  chat_history: BaseMessage[];
  query: string;
};

async function performImageSearch(query: string) {
  const searchEngine = getSearchEngineBackend();
  let images = [];

  switch (searchEngine) {
    case 'google': {
      const googleResult = await searchGooglePSE(query);
      images = googleResult.originalres
        .map((result) => {
          // Extract image URL from multiple possible locations in Google's response
          const imageSrc = result.pagemap?.cse_image?.[0]?.src ||
                            result.pagemap?.cse_thumbnail?.[0]?.src ||
                            result.image?.thumbnailLink;

          if (imageSrc && result.link && result.title) {
            images.push({
              img_src: imageSrc,
              url: result.link,
              title: result.title,
              // Add additional metadata if needed
              source: result.displayLink,
              fileFormat: result.fileFormat,
            });
          }
        })
        .filter(Boolean);
      break;
    }

    case 'searxng': {
      const searxResult = await searchSearxng(query, {
        engines: ['google images', 'bing images'],
        pageno: 1,
      });
      searxResult.results.forEach((result) => {
        if (result.img_src && result.url && result.title) {
          images.push({
            img_src: result.img_src,
            url: result.url,
            title: result.title,
          });
        }
      });
      break;
    }

    default:
      throw new Error(`Unknown search engine ${searchEngine}`);
  }

  return images;
}

const strParser = new StringOutputParser();

const createImageSearchChain = (llm: BaseChatModel) => {
  return RunnableSequence.from([
    RunnableMap.from({
      chat_history: (input: ImageSearchChainInput) => {
        return formatChatHistoryAsString(input.chat_history);
      },
      query: (input: ImageSearchChainInput) => {
        return input.query;
      },
    }),
    PromptTemplate.fromTemplate(imageSearchChainPrompt),
    llm,
    strParser,
    RunnableLambda.from(async (input: string) => {
      const images = await performImageSearch(input);
      return images.slice(0, 10);
    }),
  ]);
};

const handleImageSearch = (
  input: ImageSearchChainInput,
  llm: BaseChatModel,
) => {
  const imageSearchChain = createImageSearchChain(llm);
  return imageSearchChain.invoke(input);
};

export default handleImageSearch;
