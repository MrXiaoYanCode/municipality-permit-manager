# Municipality Permit Manager — AI/ML Pipeline Blueprint

## 1. Pipeline Overview

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│  Document   │───▶│  Text        │───▶│  Embedding  │───▶│  pgvector    │
│  Upload     │    │  Extraction  │    │  Generation │    │  Storage     │
└─────────────┘    └──────────────┘    └─────────────┘    └──────────────┘
       │                  │                                        │
       ▼                  ▼                                        ▼
┌─────────────┐    ┌──────────────┐                        ┌──────────────┐
│  Permit     │    │  Structured  │                        │  RAG Chat    │
│  Data       │    │  JSON Output │                        │  Retrieval   │
│  Extraction │    │  (deadlines) │                        │  + Generate  │
└─────────────┘    └──────────────┘                        └──────────────┘
```

---

## 2. Document Processing Pipeline

### 2.1 Upload Flow
1. User uploads PDF/image via dashboard
2. File stored in Supabase Storage (`documents/{user_id}/{filename}`)
3. `documents` table record created with `processing_status: 'pending'`
4. API route `/api/ai/extract` triggered

### 2.2 Text Extraction
```typescript
// For PDFs: extract text content
// For images: OCR via vision model
const extractedText = await extractDocumentText(fileBuffer, mimeType);
```

**Supported formats:** PDF, PNG, JPG, JPEG, WEBP

### 2.3 Permit Data Extraction (Structured Output)
```typescript
const extractionPrompt = `You are a municipal permit document parser.
Extract the following from this permit document:
- permit_name: Name/type of permit
- permit_number: Official permit number
- municipality: Issuing municipality name
- issue_date: Date issued (ISO 8601)
- expiry_date: Expiration date (ISO 8601)
- renewal_date: Next renewal date if specified
- requirements: Array of compliance requirements
- conditions: Array of permit conditions
- fees: Any associated fees

Return valid JSON only. If a field is not found, use null.`;

const response = await aiClient.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    { role: 'system', content: extractionPrompt },
    { role: 'user', content: extractedText }
  ],
  response_format: { type: 'json_object' },
  temperature: 0.1
});
```

### 2.4 Quota Enforcement
```typescript
// Before processing:
const profile = await getProfile(userId);
if (profile.documents_used >= profile.document_quota) {
  // Check if user has Stripe metered billing enabled
  if (!profile.stripe_customer_id) {
    throw new QuotaExceededError('Document quota exceeded. Upgrade your plan.');
  }
  // Report usage to Stripe meter
  await stripe.billing.meterEvents.create({
    event_name: 'document_processed',
    payload: { stripe_customer_id: profile.stripe_customer_id, value: '1' }
  });
}
// After successful processing:
await incrementDocumentUsage(userId);
```

---

## 3. Embedding & Vector Storage

### 3.1 Chunking Strategy
```typescript
const CHUNK_SIZE = 1000;      // characters
const CHUNK_OVERLAP = 200;    // characters

function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    chunks.push(text.slice(start, end));
    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }
  return chunks;
}
```

### 3.2 Embedding Generation
```typescript
const embeddingModel = 'text-embedding-3-small'; // 1536 dimensions

async function generateEmbeddings(chunks: string[]): Promise<number[][]> {
  const response = await aiClient.embeddings.create({
    model: embeddingModel,
    input: chunks
  });
  return response.data.map(d => d.embedding);
}
```

### 3.3 Vector Storage Schema
```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- HNSW index for fast similarity search
CREATE INDEX ON document_embeddings
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
```

### 3.4 Similarity Search Function
```sql
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding VECTOR(1536),
  match_user_id UUID,
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  content_chunk TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    de.id,
    de.document_id,
    de.content_chunk,
    1 - (de.embedding <=> query_embedding) AS similarity
  FROM document_embeddings de
  WHERE de.user_id = match_user_id
    AND 1 - (de.embedding <=> query_embedding) > match_threshold
  ORDER BY de.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

---

## 4. RAG Chat Pipeline

### 4.1 Query Flow
```
User Question → Embed Query → Vector Search → Context Assembly → LLM Generation → Response
```

### 4.2 Retrieval Logic
```typescript
async function retrieveContext(userId: string, query: string): Promise<string> {
  // 1. Generate query embedding
  const queryEmbedding = await generateEmbedding(query);

  // 2. Search similar chunks
  const { data: matches } = await supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_user_id: userId,
    match_threshold: 0.7,
    match_count: 5
  });

  // 3. Also fetch recent permit data for context
  const { data: permits } = await supabase
    .from('permits')
    .select('name, status, expiry_date, municipality')
    .eq('user_id', userId)
    .order('expiry_date', { ascending: true })
    .limit(10);

  // 4. Assemble context
  const docContext = matches?.map(m => m.content_chunk).join('\n\n') || '';
  const permitContext = permits?.map(p =>
    `${p.name} (${p.status}) - expires ${p.expiry_date} - ${p.municipality}`
  ).join('\n') || '';

  return `RELEVANT DOCUMENTS:\n${docContext}\n\nACTIVE PERMITS:\n${permitContext}`;
}
```

### 4.3 Prompt Orchestration
```typescript
const COMPLIANCE_SYSTEM_PROMPT = `You are PermitAI, a municipal compliance assistant for small businesses.

RULES:
1. Only answer questions about permits, compliance, and municipal regulations
2. Base answers on the provided context from the user's documents and permits
3. If unsure, say "I don't have enough information" and suggest contacting the municipality
4. Always mention specific permit names and expiry dates when relevant
5. Warn about upcoming deadlines proactively
6. Use plain language — users are business owners, not lawyers

CONTEXT:
{context}`;

async function generateChatResponse(
  userId: string,
  message: string,
  history: ChatMessage[]
): Promise<string> {
  const context = await retrieveContext(userId, message);
  const systemPrompt = COMPLIANCE_SYSTEM_PROMPT.replace('{context}', context);

  const response = await aiClient.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      ...history.slice(-10), // Last 10 messages for context window
      { role: 'user', content: message }
    ],
    temperature: 0.3,
    max_tokens: 1000
  });

  return response.choices[0].message.content;
}
```

### 4.4 Response Caching
```typescript
// Cache identical queries for 1 hour (in-memory or Supabase)
const CACHE_TTL = 3600; // seconds

async function getCachedResponse(queryHash: string): Promise<string | null> {
  const { data } = await supabase
    .from('ai_cache')
    .select('response')
    .eq('query_hash', queryHash)
    .gt('expires_at', new Date().toISOString())
    .single();
  return data?.response || null;
}
```

---

## 5. Compliance Checklist Generation

### 5.1 Industry Templates
Pre-built checklist templates per business type, stored as JSONB:

```typescript
const CHECKLIST_TEMPLATES: Record<BusinessType, ChecklistItem[]> = {
  restaurant: [
    { id: '1', title: 'Health Permit', category: 'permits', required: true },
    { id: '2', title: 'Food Handler Certificates', category: 'staff', required: true },
    { id: '3', title: 'Fire Safety Inspection', category: 'inspections', required: true },
    { id: '4', title: 'Liquor License (if applicable)', category: 'permits', required: false },
    { id: '5', title: 'Grease Trap Maintenance', category: 'maintenance', required: true },
    { id: '6', title: 'Pest Control Records', category: 'maintenance', required: true },
    { id: '7', title: 'Employee Health Records', category: 'staff', required: true },
    { id: '8', title: 'Signage Permit', category: 'permits', required: false },
  ],
  beauty_salon: [ /* ... */ ],
  cafe: [ /* ... */ ],
  event: [ /* ... */ ],
  signage: [ /* ... */ ],
  food_truck: [ /* ... */ ],
};
```

### 5.2 AI-Enhanced Checklist
After document extraction, AI can suggest additional checklist items:
```typescript
const enhancePrompt = `Based on this extracted permit data, suggest additional
compliance checklist items the business owner should track. Return JSON array of
{title, category, required, reason}.`;
```

---

## 6. Inference Configuration

| Parameter | Document Extraction | Chat | Embeddings |
|-----------|-------------------|------|------------|
| Model | gpt-4o-mini | gpt-4o-mini | text-embedding-3-small |
| Temperature | 0.1 | 0.3 | N/A |
| Max Tokens | 2000 | 1000 | N/A |
| Response Format | JSON | Text | Vector(1536) |
| Timeout | 30s | 15s | 10s |
| Retry | 2 | 1 | 2 |

### Cost Estimates (per operation)
- Document extraction: ~$0.005 (2K input + 500 output tokens)
- Embedding (per chunk): ~$0.0001
- Chat message: ~$0.002 (1K input + 500 output tokens)
- **Total per document:** ~$0.01 (matches Stripe usage pricing)

---

## 7. Error Handling & Fallbacks

```typescript
class AIPipelineError extends Error {
  constructor(
    message: string,
    public code: 'QUOTA_EXCEEDED' | 'EXTRACTION_FAILED' | 'EMBEDDING_FAILED' | 'CHAT_FAILED',
    public retryable: boolean = false
  ) {
    super(message);
  }
}

// Fallback chain for AI provider
const providers = ['openai', 'deepseek']; // configurable via AI_PROVIDER env

async function callWithFallback(fn: (client: AIClient) => Promise<any>) {
  for (const provider of providers) {
    try {
      const client = getAIClient(provider);
      return await fn(client);
    } catch (error) {
      console.error(`Provider ${provider} failed:`, error);
      continue;
    }
  }
  throw new AIPipelineError('All AI providers failed', 'CHAT_FAILED', true);
}
```

---

## 8. Monitoring & Observability

- Log all AI operations with: `user_id`, `operation`, `tokens_used`, `latency_ms`, `model`, `success`
- Track quota usage per user per billing period
- Alert on error rate > 5% over 15 minutes
- Dashboard metric: documents processed per day
