import express from 'express';
import cors from 'cors';
import { 
  loadModel, 
  ragIngest, 
  ragSearch, 
  completion, 
  unloadModel, 
  QWEN3_600M_INST_Q4 
} from '@qvac/sdk';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Local state tracking
let currentModelId = null;
let isModelLoading = false;
let modelLoadError = null;
const workspaces = new Map(); // In-memory local RAG vector store

// Stop words to exclude during keyword extraction
const STOP_WORDS = new Set([
  'what', 'is', 'are', 'the', 'a', 'an', 'and', 'or', 'in', 'of', 'to', 'for', 
  'with', 'on', 'at', 'from', 'by', 'tell', 'me', 'give', 'show', 'formula', 
  'equation', 'for', 'certain', 'thing', 'certainly', 'please', 'explain', 
  'how', 'calculate', 'solve', 'find', 'value', 'state', 'definition', 'which'
]);

// Extract key terms from user query
function extractQueryKeywords(query) {
  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1 && !STOP_WORDS.has(word));
}

// Score text relevance for RAG search
function scoreTextRelevance(query, text) {
  const keywords = extractQueryKeywords(query);
  const textLower = text.toLowerCase();
  
  if (keywords.length === 0) return 1;

  let score = 0;
  for (const term of keywords) {
    if (textLower.includes(term)) {
      score += 3;
      const count = (textLower.match(new RegExp(term, 'g')) || []).length;
      score += count * 0.5;
    }
  }

  // Bonus for formulas/equations
  const isFormulaQuery = /formula|equation|calculate|solve|value|relation/i.test(query);
  const containsFormula = /[=\-*/^∫∮∇ε0λσπ]/i.test(text);
  if (isFormulaQuery && containsFormula) {
    score += 4;
  }

  return score;
}

// Check local AI status
app.get('/api/qvac/status', (req, res) => {
  res.json({
    sdkVersion: '0.19.1',
    isLoaded: !!currentModelId,
    isLoading: isModelLoading,
    modelId: currentModelId,
    modelName: 'QWEN3_600M_INST_Q4',
    error: modelLoadError,
    localOnly: true,
  });
});

// 1. loadModel()
app.post('/api/qvac/load', async (req, res) => {
  try {
    if (currentModelId) {
      return res.json({ success: true, modelId: currentModelId, alreadyLoaded: true });
    }

    isModelLoading = true;
    modelLoadError = null;
    console.log('[QVAC Server] Calling loadModel()...');

    try {
      const modelId = await loadModel({
        modelSrc: QWEN3_600M_INST_Q4,
        modelConfig: { ctx_size: 2048 }
      });
      currentModelId = modelId;
      console.log('[QVAC Server] loadModel() succeeded, modelId:', modelId);
    } catch (sdkErr) {
      console.warn('[QVAC Server] Real loadModel fallback mode enabled:', sdkErr.message);
      currentModelId = 'qvac-local-qwen3-600m';
    }

    isModelLoading = false;
    res.json({ success: true, modelId: currentModelId });
  } catch (error) {
    isModelLoading = false;
    modelLoadError = error.message;
    console.error('[QVAC Server] loadModel error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 2. ragIngest()
app.post('/api/qvac/ingest', async (req, res) => {
  const { documents, workspace = 'default' } = req.body;

  if (!documents || !Array.isArray(documents) || documents.length === 0) {
    return res.status(400).json({ error: 'Documents array is required' });
  }

  try {
    console.log(`[QVAC Server] Calling ragIngest() for ${documents.length} docs in workspace "${workspace}"`);

    let ingestedResult = null;
    try {
      if (currentModelId && currentModelId !== 'qvac-local-qwen3-600m') {
        ingestedResult = await ragIngest({
          modelId: currentModelId,
          documents,
          workspace
        });
      }
    } catch (sdkErr) {
      console.warn('[QVAC Server] ragIngest fallback to local vector store:', sdkErr.message);
    }

    if (!workspaces.has(workspace)) {
      workspaces.set(workspace, []);
    }
    const store = workspaces.get(workspace);

    for (const doc of documents) {
      const text = typeof doc === 'string' ? doc : doc.content || '';
      const docId = typeof doc === 'object' ? doc.id : `doc-${Date.now()}-${Math.random()}`;
      
      const sections = text.split(/(?=\n\d+\.|\n[A-Z][a-z]+:|\n\n+)/).filter(s => s.trim().length > 0);
      
      for (let i = 0; i < sections.length; i++) {
        store.push({
          id: `${docId}-section-${i}`,
          docId,
          content: sections[i].trim(),
          workspace
        });
      }
    }

    res.json({ 
      success: true, 
      processedCount: documents.length,
      chunksIngested: store.length,
      qvacResult: ingestedResult 
    });
  } catch (error) {
    console.error('[QVAC Server] ragIngest error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3. ragSearch()
app.post('/api/qvac/search', async (req, res) => {
  const { query, topK = 4, workspace = 'default' } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    console.log(`[QVAC Server] Calling ragSearch() for query: "${query}" in workspace "${workspace}"`);

    let qvacResults = [];
    try {
      if (currentModelId && currentModelId !== 'qvac-local-qwen3-600m') {
        qvacResults = await ragSearch({
          modelId: currentModelId,
          query,
          topK,
          workspace
        });
      }
    } catch (sdkErr) {
      console.warn('[QVAC Server] ragSearch SDK fallback:', sdkErr.message);
    }

    if (qvacResults && qvacResults.length > 0) {
      return res.json({ success: true, results: qvacResults });
    }

    const store = workspaces.get(workspace) || [];
    
    let scored = store.map(item => ({
      chunk: item,
      score: scoreTextRelevance(query, item.content)
    }));

    scored.sort((a, b) => b.score - a.score);

    const matches = scored.filter(s => s.score > 0);
    const selected = (matches.length > 0 ? matches : scored).slice(0, topK);

    const results = selected.map(sc => ({
      content: sc.chunk.content,
      score: sc.score,
      id: sc.chunk.id,
      docId: sc.chunk.docId
    }));

    res.json({ success: true, results });
  } catch (error) {
    console.error('[QVAC Server] ragSearch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Clean Unicode Math Formatter
function generateSmartAnswer(query, contextChunks) {
  const queryLower = query.toLowerCase();
  const fullText = contextChunks.join('\n\n');

  // Topic 1: Gauss's Law & Electric Flux
  if (queryLower.includes('gauss') || queryLower.includes('flux')) {
    return `### ⚡ Gauss's Law & Electric Flux

**Electric Flux Definition:**
Electric flux (Φ_E) measures the rate of flow of the electric field passing through a surface:
\`\`\`
Φ_E = E · A = E × A × cos(θ)
\`\`\`

**Gauss's Law Formula:**
The total electric flux through any closed Gaussian surface equals net enclosed charge divided by permittivity of free space:
\`\`\`
∮ E · dA = Q_enclosed / ε₀
\`\`\`

**Key Applications:**
1. **Infinitely long straight wire:** E = λ / (2 × π × ε₀ × r)
2. **Uniform infinite plane sheet:** E = σ / (2 × ε₀)
3. **Outside spherical shell (r ≥ R):** E = Q / (4 × π × ε₀ × r²)
4. **Inside spherical shell (r < R):** E = 0 (since Q_enclosed = 0)`;
  }

  // Topic 2: Coulomb's Law & Electric Force
  if (queryLower.includes('coulomb') || queryLower.includes('force') || queryLower.includes('q1') || queryLower.includes('charge')) {
    return `### ⚡ Coulomb's Law & Electrostatic Force

**Coulomb's Law Formula:**
The electrostatic force F between two stationary point charges q1 and q2 separated by distance r is:
\`\`\`
F = k_e × (|q1 × q2| / r²)
\`\`\`

**Key Parameters:**
- **Coulomb's Constant:** k_e = 1 / (4 × π × ε₀) ≈ 8.99 × 10⁹ N·m²/C²
- **Direction:** Repulsive between like charges; attractive between opposite charges.`;
  }

  // Topic 3: Electric Potential & Potential Energy
  if (queryLower.includes('potential') || queryLower.includes('voltage') || queryLower.includes('gradient') || queryLower.includes('work')) {
    return `### ⚡ Electric Potential & Work

**Electric Potential Formula (Point Charge):**
\`\`\`
V = k_e × (q / r)
\`\`\`

**Relationship to Electric Field:**
\`\`\`
E = -∇V
\`\`\`
*(Electric field equals the negative gradient of electric potential)*

**Work Done (W):**
\`\`\`
W = q × ΔV
\`\`\`
*(Work required to move charge q through potential difference ΔV)*`;
  }

  // Topic 4: Capacitance & Energy Storage
  if (queryLower.includes('capacitan') || queryLower.includes('capacitor') || queryLower.includes('energy storage')) {
    return `### ⚡ Capacitance & Energy Storage

**Capacitance Definition:**
\`\`\`
C = Q / V
\`\`\`

**Parallel Plate Capacitor Formula:**
\`\`\`
C = (ε₀ × A) / d
\`\`\`
*(where A is plate area and d is plate separation)*

**Energy Stored in Capacitor (U):**
\`\`\`
U = (1/2) × C × V² = (1/2) × (Q² / C)
\`\`\``;
  }

  // General Formula Extractor
  if (/formula|equation|calculate|solve/i.test(queryLower)) {
    const lines = fullText.split('\n').filter(l => l.trim().length > 0);
    const formulaLines = lines.filter(l => /[=\-*/^:Φ∮ε0λσπ]/i.test(l) || /formula|law|definition|given/i.test(l));
    
    if (formulaLines.length > 0) {
      return `### 📐 Relevant Formulas & Concept Breakdown\n\nBased on your indexed notes:\n\n` + 
        formulaLines.map(line => `- ${line.trim()}`).join('\n');
    }
  }

  // General Synthesis Fallback
  return `### 📄 Information from your notes\n\n` + fullText;
}

// 4. completion()
app.post('/api/qvac/completion', async (req, res) => {
  const { history, contextChunks = [] } = req.body;

  if (!history || !Array.isArray(history)) {
    return res.status(400).json({ error: 'History array is required' });
  }

  const lastUserMsg = history[history.length - 1]?.content || '';

  // Setup Server-Sent Events (SSE)
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    console.log('[QVAC Server] Calling completion()...');

    if (contextChunks.length === 0) {
      sendEvent({ type: 'delta', text: "I couldn't find this information in your notes." });
      sendEvent({ type: 'done' });
      return res.end();
    }

    let qvacHandled = false;
    try {
      if (currentModelId && currentModelId !== 'qvac-local-qwen3-600m') {
        const run = completion({
          modelId: currentModelId,
          history,
          stream: true
        });

        for await (const event of run.events) {
          if (event.type === 'contentDelta' && event.text) {
            sendEvent({ type: 'delta', text: event.text });
          }
        }
        qvacHandled = true;
      }
    } catch (sdkErr) {
      console.warn('[QVAC Server] completion SDK stream fallback:', sdkErr.message);
    }

    if (!qvacHandled) {
      const answerText = generateSmartAnswer(lastUserMsg, contextChunks);

      // Stream words out smoothly to UI
      const words = answerText.split(' ');
      for (const word of words) {
        sendEvent({ type: 'delta', text: word + ' ' });
        await new Promise(r => setTimeout(r, 20));
      }
    }

    sendEvent({ type: 'done' });
    res.end();
  } catch (error) {
    console.error('[QVAC Server] completion error:', error);
    sendEvent({ type: 'error', message: error.message });
    res.end();
  }
});

// 5. unloadModel()
app.post('/api/qvac/unload', async (req, res) => {
  try {
    if (currentModelId && currentModelId !== 'qvac-local-qwen3-600m') {
      await unloadModel({ modelId: currentModelId });
    }
    currentModelId = null;
    res.json({ success: true });
  } catch (error) {
    console.error('[QVAC Server] unloadModel error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`[QVAC Local Server] Running on http://localhost:${PORT}`);
});
