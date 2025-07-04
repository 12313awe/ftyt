import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import * as fs from 'fs/promises';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !GOOGLE_API_KEY) {
  throw new Error('Missing environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY, and NEXT_PUBLIC_GOOGLE_API_KEY are set.');
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const embeddings = new GoogleGenerativeAIEmbeddings({ apiKey: GOOGLE_API_KEY });

async function deleteAllDocuments() {
  console.log('Deleting all documents from document_chunks table...');
  const { error } = await supabaseAdmin.from('document_chunks').delete().neq('id', 0); // Delete all rows

  if (error) {
    console.error('Error deleting documents:', error.message);
    throw error;
  } else {
    console.log('All documents deleted successfully!');
  }
}

async function addDocuments() {
  // PDF dosyalarını bulma ve işleme
  const files = await fs.readdir(process.cwd());
  const pdfFiles = files.filter(file => file.endsWith('.pdf'));

  if (pdfFiles.length === 0) {
    console.log('No PDF files found in the current directory. Please place your PDF files here.');
    return;
  }

  console.log(`Found ${pdfFiles.length} PDF files. Starting upload process...`);

  for (const pdfFile of pdfFiles) {
    const filePath = path.join(process.cwd(), pdfFile);
    console.log(`Processing: ${pdfFile}`);

    // PDF belgesini yükleme
    const loader = new PDFLoader(filePath);
    const rawDocs = await loader.load();

    // Belgeleri parçalara ayırma
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const docs = await splitter.splitDocuments(rawDocs);

    // Her bir belge parçasının içeriğini temizle
    docs.forEach(doc => {
      let cleanedContent = Buffer.from(doc.pageContent, 'utf8').toString('utf8');
      cleanedContent = cleanedContent.replace(/[^\x20-\x7E\n\r\t]/g, '');
      doc.pageContent = cleanedContent;
    });

    console.log(`Split ${pdfFile} into ${docs.length} chunks. Uploading to Supabase...`);

    // Supabase'e yükleme
    try {
      await SupabaseVectorStore.fromDocuments(
        docs,
        embeddings,
        {
          client: supabaseAdmin,
          tableName: 'document_chunks',
          queryName: 'match_documents',
        }
      );
      console.log(`${pdfFile} uploaded successfully!`);
    } catch (uploadError: any) {
      console.error(`Error uploading ${pdfFile}:`, uploadError.message);
    }
  }

  console.log('All documents processed and uploaded successfully!');
}

async function main() {
  const args = process.argv.slice(2); // Komut satırı argümanlarını al

  if (args.includes('--delete')) {
    await deleteAllDocuments();
  } else if (args.includes('--add')) {
    await addDocuments();
  } else {
    console.log('Usage: npx tsx manage-documents.ts [--add | --delete]');
    console.log('  --add: Adds PDF documents found in the current directory to Supabase.');
    console.log('  --delete: Deletes all documents from the document_chunks table in Supabase.');
  }
}

main(); 