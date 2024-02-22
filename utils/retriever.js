import { SupabaseVectorStore } from 'langchain/vectorstores/supabase'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { createClient } from '@supabase/supabase-js'

const openAIApiKey = '';

const embeddings = new OpenAIEmbeddings({ openAIApiKey });
const sbApiKey = '';
const sbUrl = '';

const client = createClient(sbUrl, sbApiKey)

const vectorStore = new SupabaseVectorStore(embeddings, {
    client,
    tableName: 'documentsforpassistant',
    queryName: 'match_documentsforpassistant'
})

const retriever = vectorStore.asRetriever()

export { retriever }