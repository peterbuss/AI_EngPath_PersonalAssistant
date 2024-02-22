import { ChatOpenAI } from 'langchain/chat_models/openai'
import { PromptTemplate } from 'langchain/prompts'
import { StringOutputParser } from 'langchain/schema/output_parser'
import { retriever } from '/utils/retriever'
import { combineDocuments } from '/utils/combineDocuments'
import { RunnablePassthrough, RunnableSequence } from "langchain/schema/runnable"
import { formatConvHistory } from '/utils/formatConvHistory'


aishForm.addEventListener("submit", handleSubmit);

function handleSubmit(e) {
  e.preventDefault();
  progressConversation()                      
}
  

const openAIApiKey = '';
const llm = new ChatOpenAI({ openAIApiKey });
                      


const standaloneQuestionTemplate = `Given some conversation history (if any) and a question, convert the question to a standalone question. 
conversation history: {conv_history}
question: {question} 
standalone question:`
const standaloneQuestionPrompt = PromptTemplate.fromTemplate(standaloneQuestionTemplate)

const answerTemplate = `You are a helpful and enthusiastic support bot who can answer a given question about my person based on the context provided and the conversation history. Try to find the answer in the context. If the answer is not given in the context, find the answer in the conversation history if possible. If you really don't know the answer, say "I'm sorry, I don't know the answer to that.".  Don't try to make up an answer. Always speak as if you were chatting to a friend. Use no more than 30 words in your answer.
context: {context}
conversation history: {conv_history}
question: {question}
answer: `
const answerPrompt = PromptTemplate.fromTemplate(answerTemplate)

const standaloneQuestionChain = standaloneQuestionPrompt
    .pipe(llm)
    .pipe(new StringOutputParser())

const retrieverChain = RunnableSequence.from([
    prevResult => prevResult.standalone_question,
    retriever,
    combineDocuments
])

const answerChain = answerPrompt
    .pipe(llm)
    .pipe(new StringOutputParser())

const chain = RunnableSequence.from([
    {
        standalone_question: standaloneQuestionChain,
        original_input: new RunnablePassthrough()
    },
    {
        context: retrieverChain,
        question: ({ original_input }) => original_input.question,
        conv_history: ({ original_input }) => original_input.conv_history
    },
    answerChain
])

const convHistory = []

async function progressConversation() {
    
let question = document.getElementById('input-text').value;
  
  console.log(question);
  
  document.getElementById('input-text').value = "";
  
  const date = new Date();
  const DTstr = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +  date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
  
  console.log(DTstr);
  
  let questionEle =	`<div class="question">
                        <p>${DTstr}</p>
                        <div class="question-grp">
                          <div>
                            <img class="image-question" src="images/rafidhoda.png" alt="rafid">
                          </div>
                          <div class="question-text">
                            <p>${question}</p>
                          </div>
                        </div>
                      </div>`;

  let informationTag = document.querySelector(".information");
  informationTag.innerHTML += questionEle;
                            
    const response = await chain.invoke({
        question: question,
        conv_history: formatConvHistory(convHistory)
    })
    convHistory.push(question)
    convHistory.push(response)

  console.log("ans : ", response);
                      
  const dateA = new Date();
  const DTstrA = dateA.getFullYear() + "-" + (dateA.getMonth() + 1) + "-" + dateA.getDate() + " " +  dateA.getHours() + ":" + dateA.getMinutes() + ":" + dateA.getSeconds();
  
  console.log(DTstr) ;         

  let answerEle = `<div class="answer">
                    <p>${DTstrA}</p>
                    <div class="answer-grp">
                      <div>
                        <p class="answer-text">${response}</p>
                      </div>
                      <div>
                        <img class="image-answer" src="images/Aish3.png" alt="aish">
                      </div>
                    </div>
                  </div>`;

  informationTag.innerHTML += answerEle;

}