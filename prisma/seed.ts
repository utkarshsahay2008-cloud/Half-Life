import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding HALF-LIFE Temporal Decay & Fact Freshness Lab Database...");

  // Clear existing records to ensure clean state
  await prisma.tavilySource.deleteMany();
  await prisma.claim.deleteMany();
  await prisma.auditReport.deleteMany();

  // =========================================================================
  // Specimen 1: API Version & SDK Deprecation Drift
  // =========================================================================
  const spec1 = await prisma.auditReport.create({
    data: {
      slug: "spec-api-drift",
      title: "OpenAI Assistants API v1 vs v2 Deprecation Drift",
      mode: "AUDIT",
      rawText: `To deploy an OpenAI Assistant with document search capabilities, initialize the run as follows:
const run = await openai.beta.threads.runs.create(threadId, {
  assistant_id: assistantId,
  tools: [{ type: "retrieval" }]
});
Note: The HTTP request requires the header 'Openai-Beta: assistants=v1' to ensure compatibility.
Cosine similarity is calculated as the dot product of two vectors divided by the product of their Euclidean lengths.`,
      patchedText: `To deploy an OpenAI Assistant with document search capabilities, initialize the run as follows:
const run = await openai.beta.threads.runs.createAndPoll(threadId, {
  assistant_id: assistantId,
  tools: [{ type: "file_search" }]
});
Note: The HTTP request requires the header 'Openai-Beta: assistants=v2' with vector store attachments.
Cosine similarity is calculated as the dot product of two vectors divided by the product of their Euclidean lengths.`,
      overallFreshnessScore: 41,
      searchSkipSavingsMs: 420,
      bifrostRoutingTrace: JSON.stringify([
        {
          stage: "EXTRACTION",
          model: "groq/openai/gpt-oss-20b",
          routedVia: "Bifrost Gateway (@maximhq/bifrost)",
          latencyMs: 215,
          tokensUsed: 290,
          timestamp: "2024-11-20T10:00:00Z",
        },
        {
          stage: "ADJUDICATION",
          model: "groq/openai/gpt-oss-120b",
          routedVia: "Bifrost Gateway (@maximhq/bifrost)",
          latencyMs: 460,
          tokensUsed: 620,
          timestamp: "2024-11-20T10:00:02Z",
        },
      ]),
      claims: {
        create: [
          {
            claimIndex: 0,
            originalSpan: `const run = await openai.beta.threads.runs.create(threadId, {
  assistant_id: assistantId,
  tools: [{ type: "retrieval" }]
});`,
            category: "API_VERSION",
            halfLifeDays: 90,
            expiredAtDate: "2024-04-17",
            freshnessScore: 10,
            status: "STALE",
            liveTruth:
              "Assistants API v1 was deprecated on April 17, 2024. The 'retrieval' tool was superseded by 'file_search' utilizing dedicated vector stores, and execution requires polling or streaming handlers.",
            correctedReplacement: `const run = await openai.beta.threads.runs.createAndPoll(threadId, {
  assistant_id: assistantId,
  tools: [{ type: "file_search" }]
});`,
            adjudicatorReasoning:
              "Official OpenAI developer documentation confirms that v1 endpoints fail with 400 Bad Request. 'retrieval' tool configuration is no longer accepted.",
            sources: {
              create: [
                {
                  title: "OpenAI Assistants API v2 Official Migration Guide",
                  url: "https://platform.openai.com/docs/assistants/migration",
                  domain: "platform.openai.com",
                  publishedDate: "2024-04-18",
                  snippet:
                    "Assistants API v2 replaces the retrieval tool with file_search. Vector stores now manage file chunking and embeddings automatically.",
                  relevanceScore: 0.98,
                },
                {
                  title: "OpenAI Developer Forum: Sunset Timeline for v1 Beta",
                  url: "https://community.openai.com/t/assistants-v1-deprecation-schedule/729104",
                  domain: "community.openai.com",
                  publishedDate: "2024-06-15",
                  snippet:
                    "Endpoints using Openai-Beta: assistants=v1 will return 400 errors after the transition window closes.",
                  relevanceScore: 0.92,
                },
              ],
            },
          },
          {
            claimIndex: 1,
            originalSpan: "The HTTP request requires the header 'Openai-Beta: assistants=v1' to ensure compatibility.",
            category: "API_VERSION",
            halfLifeDays: 90,
            expiredAtDate: "2024-04-17",
            freshnessScore: 15,
            status: "STALE",
            liveTruth:
              "The current required header is 'Openai-Beta: assistants=v2'. Using v1 triggers deprecation notices and breaks file search capabilities.",
            correctedReplacement:
              "The HTTP request requires the header 'Openai-Beta: assistants=v2' with vector store attachments.",
            adjudicatorReasoning:
              "Bifrost adjudicated this as STALE based on Tavily documentation citations confirming v2 header requirement.",
            sources: {
              create: [
                {
                  title: "API Reference: Headers and Authentication v2",
                  url: "https://platform.openai.com/docs/api-reference",
                  domain: "platform.openai.com",
                  publishedDate: "2024-05-01",
                  snippet:
                    "All Assistant v2 API requests must include the Openai-Beta: assistants=v2 request header.",
                  relevanceScore: 0.96,
                },
              ],
            },
          },
          {
            claimIndex: 2,
            originalSpan:
              "Cosine similarity is calculated as the dot product of two vectors divided by the product of their Euclidean lengths.",
            category: "STATIC",
            halfLifeDays: 99999,
            expiredAtDate: "NEVER",
            freshnessScore: 100,
            status: "FRESH",
            liveTruth:
              "Invariant mathematical definition. Cosine similarity = (A · B) / (||A|| ||B||). Timeless constant across linear algebra.",
            correctedReplacement:
              "Cosine similarity is calculated as the dot product of two vectors divided by the product of their Euclidean lengths.",
            adjudicatorReasoning:
              "STATIC Category: Search-Skip Optimization applied. Tavily query bypassed (saved 420ms). Timeless mathematical principle.",
            sources: {
              create: [
                {
                  title: "Search-Skip Optimization (STATIC Fact Bypass)",
                  url: "https://halflife.internal/search-skip",
                  domain: "halflife.internal",
                  publishedDate: "PERMANENT",
                  snippet:
                    "Timeless mathematical invariant. Tavily search skipped, saving API costs and 420ms of round-trip latency.",
                  relevanceScore: 1.0,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // =========================================================================
  // Specimen 2: SaaS & LLM Token Pricing Rot
  // =========================================================================
  const spec2 = await prisma.auditReport.create({
    data: {
      slug: "spec-pricing-rot",
      title: "Frontier LLM Token Economics & Batch Rate Rot",
      mode: "AUDIT",
      rawText: `Enterprise AI Budgeting Guide:
GPT-4 flagship costs $30.00 per 1M input tokens and $60.00 per 1M output tokens for developer API endpoints.
Anthropic Claude models offer no prompt caching discount for static system instructions.
One token is roughly equivalent to 4 characters or 0.75 English words in standard BPE tokenizers.`,
      patchedText: `Enterprise AI Budgeting Guide:
GPT-4o flagship costs $2.50 per 1M input tokens and $10.00 per 1M output tokens with Batch API 50% discount.
Anthropic Claude models offer up to 90% prompt caching discount for static system instructions.
One token is roughly equivalent to 4 characters or 0.75 English words in standard BPE tokenizers.`,
      overallFreshnessScore: 49,
      searchSkipSavingsMs: 420,
      bifrostRoutingTrace: JSON.stringify([
        {
          stage: "EXTRACTION",
          model: "groq/openai/gpt-oss-20b",
          routedVia: "Bifrost Gateway (@maximhq/bifrost)",
          latencyMs: 198,
          tokensUsed: 260,
          timestamp: "2024-11-20T10:02:00Z",
        },
        {
          stage: "ADJUDICATION",
          model: "groq/openai/gpt-oss-120b",
          routedVia: "Bifrost Gateway (@maximhq/bifrost)",
          latencyMs: 430,
          tokensUsed: 590,
          timestamp: "2024-11-20T10:02:02Z",
        },
      ]),
      claims: {
        create: [
          {
            claimIndex: 0,
            originalSpan:
              "GPT-4 flagship costs $30.00 per 1M input tokens and $60.00 per 1M output tokens for developer API endpoints.",
            category: "PRICING",
            halfLifeDays: 60,
            expiredAtDate: "2024-05-13",
            freshnessScore: 22,
            status: "STALE",
            liveTruth:
              "GPT-4 has been superseded in production by GPT-4o, which costs $2.50 per 1M input tokens and $10.00 per 1M output tokens (a ~92% cost reduction).",
            correctedReplacement:
              "GPT-4o flagship costs $2.50 per 1M input tokens and $10.00 per 1M output tokens with Batch API 50% discount.",
            adjudicatorReasoning:
              "Tavily search of openai.com/pricing confirms major price reductions announced May 2024 with GPT-4o release.",
            sources: {
              create: [
                {
                  title: "OpenAI Pricing: Introducing GPT-4o & Modern Rate Cards",
                  url: "https://openai.com/pricing",
                  domain: "openai.com",
                  publishedDate: "2024-05-13",
                  snippet:
                    "GPT-4o is 2x faster, half the price, and has 5x higher rate limits compared to GPT-4 Turbo. Input: $2.50/1M tokens, Output: $10.00/1M tokens.",
                  relevanceScore: 0.99,
                },
              ],
            },
          },
          {
            claimIndex: 1,
            originalSpan:
              "Anthropic Claude models offer no prompt caching discount for static system instructions.",
            category: "PRICING",
            halfLifeDays: 75,
            expiredAtDate: "2024-08-14",
            freshnessScore: 25,
            status: "STALE",
            liveTruth:
              "Anthropic launched Prompt Caching on August 14, 2024, offering up to 90% discount on cached input tokens and 80% reduction in time-to-first-token.",
            correctedReplacement:
              "Anthropic Claude models offer up to 90% prompt caching discount for static system instructions.",
            adjudicatorReasoning:
              "Verified by Anthropic's official August 2024 product release notes introducing prompt caching for Claude 3.5 Sonnet and Opus.",
            sources: {
              create: [
                {
                  title: "Anthropic Engineering: Prompt Caching with Claude",
                  url: "https://www.anthropic.com/news/prompt-caching",
                  domain: "anthropic.com",
                  publishedDate: "2024-08-14",
                  snippet:
                    "Customers can cache frequently used context between API calls, cutting costs by up to 90% and latency by up to 85% for long prompts.",
                  relevanceScore: 0.97,
                },
              ],
            },
          },
          {
            claimIndex: 2,
            originalSpan:
              "One token is roughly equivalent to 4 characters or 0.75 English words in standard BPE tokenizers.",
            category: "STATIC",
            halfLifeDays: 99999,
            expiredAtDate: "NEVER",
            freshnessScore: 100,
            status: "FRESH",
            liveTruth:
              "Fundamental rule of thumb for English language byte-pair encoding (cl100k_base / o200k_base). Timeless metric.",
            correctedReplacement:
              "One token is roughly equivalent to 4 characters or 0.75 English words in standard BPE tokenizers.",
            adjudicatorReasoning:
              "STATIC Category: Search-Skip Optimization applied. Timeless empirical constant.",
            sources: {
              create: [
                {
                  title: "Search-Skip Optimization (STATIC Fact Bypass)",
                  url: "https://halflife.internal/search-skip",
                  domain: "halflife.internal",
                  publishedDate: "PERMANENT",
                  snippet:
                    "Timeless tokenizer invariant. Tavily search skipped, saving 420ms of round-trip latency.",
                  relevanceScore: 1.0,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // =========================================================================
  // Specimen 3: Tech Leadership & Governance Turnover
  // =========================================================================
  const spec3 = await prisma.auditReport.create({
    data: {
      slug: "spec-leadership",
      title: "AI Lab Executive & Governance Drift",
      mode: "AUDIT",
      rawText: `AI Industry Leadership Analysis:
Stability AI is currently led by founder and CEO Emad Mostaque, who maintains full control of the open-source diffusion roadmap.
At OpenAI, Mira Murati serves as Chief Technology Officer directing all research labs.
Neural network gradient descent optimizes model weights via backpropagation.`,
      patchedText: `AI Industry Leadership Analysis:
Stability AI is led by CEO Prem Akkaraju and Executive Chairman James O'Shaughnessy following corporate restructuring.
At OpenAI, former CTO Mira Murati departed the company in September 2024 to launch a new independent venture.
Neural network gradient descent optimizes model weights via backpropagation.`,
      overallFreshnessScore: 39,
      searchSkipSavingsMs: 420,
      bifrostRoutingTrace: JSON.stringify([
        {
          stage: "EXTRACTION",
          model: "groq/openai/gpt-oss-20b",
          routedVia: "Bifrost Gateway (@maximhq/bifrost)",
          latencyMs: 185,
          tokensUsed: 250,
          timestamp: "2024-11-20T10:04:00Z",
        },
        {
          stage: "ADJUDICATION",
          model: "groq/openai/gpt-oss-120b",
          routedVia: "Bifrost Gateway (@maximhq/bifrost)",
          latencyMs: 445,
          tokensUsed: 580,
          timestamp: "2024-11-20T10:04:02Z",
        },
      ]),
      claims: {
        create: [
          {
            claimIndex: 0,
            originalSpan:
              "Stability AI is currently led by founder and CEO Emad Mostaque, who maintains full control of the open-source diffusion roadmap.",
            category: "LEADERSHIP",
            halfLifeDays: 180,
            expiredAtDate: "2024-03-23",
            freshnessScore: 6,
            status: "STALE",
            liveTruth:
              "Emad Mostaque resigned as CEO on March 23, 2024. In June 2024, Prem Akkaraju was named CEO and James O'Shaughnessy became Executive Chairman following an investment round.",
            correctedReplacement:
              "Stability AI is led by CEO Prem Akkaraju and Executive Chairman James O'Shaughnessy following corporate restructuring.",
            adjudicatorReasoning:
              "Verified by Bloomberg, Reuters, and Stability AI official press release confirming Mostaque's departure in March 2024.",
            sources: {
              create: [
                {
                  title: "Bloomberg: Stability AI Founder Emad Mostaque Steps Down as CEO",
                  url: "https://www.bloomberg.com/news/articles/2024-03-23/stability-ai-ceo-mostaque-resigns",
                  domain: "bloomberg.com",
                  publishedDate: "2024-03-23",
                  snippet:
                    "Emad Mostaque has resigned from his role as CEO of Stability AI and from the company's board of directors to pursue decentralized AI.",
                  relevanceScore: 0.98,
                },
                {
                  title: "TechCrunch: Prem Akkaraju Appointed CEO of Stability AI",
                  url: "https://techcrunch.com/2024/06/25/stability-ai-secures-new-funding-names-prem-akkaraju-ceo",
                  domain: "techcrunch.com",
                  publishedDate: "2024-06-25",
                  snippet:
                    "Former Weta Digital CEO Prem Akkaraju has been appointed chief executive officer of Stability AI alongside a major recapitalization.",
                  relevanceScore: 0.94,
                },
              ],
            },
          },
          {
            claimIndex: 1,
            originalSpan:
              "At OpenAI, Mira Murati serves as Chief Technology Officer directing all research labs.",
            category: "LEADERSHIP",
            halfLifeDays: 180,
            expiredAtDate: "2024-09-25",
            freshnessScore: 12,
            status: "STALE",
            liveTruth:
              "Mira Murati announced her departure from OpenAI on September 25, 2024, after six and a half years at the company.",
            correctedReplacement:
              "At OpenAI, former CTO Mira Murati departed the company in September 2024 to launch a new independent venture.",
            adjudicatorReasoning:
              "Tavily search retrieved confirmed news reports of Murati's public resignation on September 25, 2024.",
            sources: {
              create: [
                {
                  title: "The Verge: OpenAI CTO Mira Murati is Leaving the Company",
                  url: "https://www.theverge.com/2024/9/25/24254256/openai-mira-murati-cto-stepping-down",
                  domain: "theverge.com",
                  publishedDate: "2024-09-25",
                  snippet:
                    "Mira Murati has resigned as chief technology officer of OpenAI after six and a half years at the ChatGPT creator.",
                  relevanceScore: 0.99,
                },
              ],
            },
          },
          {
            claimIndex: 2,
            originalSpan:
              "Neural network gradient descent optimizes model weights via backpropagation.",
            category: "STATIC",
            halfLifeDays: 99999,
            expiredAtDate: "NEVER",
            freshnessScore: 100,
            status: "FRESH",
            liveTruth:
              "Core mathematical principle of deep learning established by Rumelhart, Hinton, and Williams (1986). Invariant foundation.",
            correctedReplacement:
              "Neural network gradient descent optimizes model weights via backpropagation.",
            adjudicatorReasoning:
              "STATIC Category: Search-Skip Optimization applied. Timeless deep learning foundational truth.",
            sources: {
              create: [
                {
                  title: "Search-Skip Optimization (STATIC Fact Bypass)",
                  url: "https://halflife.internal/search-skip",
                  domain: "halflife.internal",
                  publishedDate: "PERMANENT",
                  snippet:
                    "Timeless deep learning invariant. Tavily search skipped, saving 420ms of round-trip latency.",
                  relevanceScore: 1.0,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // =========================================================================
  // Specimen 4: Global AI Regulation Shifts
  // =========================================================================
  const spec4 = await prisma.auditReport.create({
    data: {
      slug: "spec-regulation",
      title: "Global AI Safety & Regulatory Compliance Mandates",
      mode: "AUDIT",
      rawText: `AI Regulatory Compliance Memo:
California enacted SB 1047 into law, requiring mandatory safety kill-switches and frontier developer liability before deployment.
The European Union AI Act has not yet passed committee voting.
Deterministic finite automata recognize regular languages without internal backtracking.`,
      patchedText: `AI Regulatory Compliance Memo:
California SB 1047 was vetoed by Governor Newsom in September 2024; narrower transparency measures were signed instead.
The European Union AI Act entered into legal force on August 1, 2024, with phased enforcement starting February 2025.
Deterministic finite automata recognize regular languages without internal backtracking.`,
      overallFreshnessScore: 37,
      searchSkipSavingsMs: 420,
      bifrostRoutingTrace: JSON.stringify([
        {
          stage: "EXTRACTION",
          model: "groq/openai/gpt-oss-20b",
          routedVia: "Bifrost Gateway (@maximhq/bifrost)",
          latencyMs: 205,
          tokensUsed: 275,
          timestamp: "2024-11-20T10:06:00Z",
        },
        {
          stage: "ADJUDICATION",
          model: "groq/openai/gpt-oss-120b",
          routedVia: "Bifrost Gateway (@maximhq/bifrost)",
          latencyMs: 450,
          tokensUsed: 610,
          timestamp: "2024-11-20T10:06:02Z",
        },
      ]),
      claims: {
        create: [
          {
            claimIndex: 0,
            originalSpan:
              "California enacted SB 1047 into law, requiring mandatory safety kill-switches and frontier developer liability before deployment.",
            category: "REGULATION",
            halfLifeDays: 120,
            expiredAtDate: "2024-09-29",
            freshnessScore: 8,
            status: "STALE",
            liveTruth:
              "California Governor Gavin Newsom officially vetoed Senate Bill 1047 on September 29, 2024. The proposed liability and kill-switch requirements did not become law.",
            correctedReplacement:
              "California SB 1047 was vetoed by Governor Newsom in September 2024; narrower transparency measures were signed instead.",
            adjudicatorReasoning:
              "Tavily search retrieved official California Gubernatorial veto message and Reuters coverage confirming SB 1047 was rejected.",
            sources: {
              create: [
                {
                  title: "Reuters: California Governor Newsom Vetoes Landmark AI Safety Bill",
                  url: "https://www.reuters.com/technology/california-governor-newsom-vetoes-ai-safety-bill-2024-09-29/",
                  domain: "reuters.com",
                  publishedDate: "2024-09-29",
                  snippet:
                    "California Governor Gavin Newsom on Sunday vetoed a contentious artificial intelligence safety bill after intense opposition from tech startups and AI labs.",
                  relevanceScore: 0.99,
                },
              ],
            },
          },
          {
            claimIndex: 1,
            originalSpan: "The European Union AI Act has not yet passed committee voting.",
            category: "REGULATION",
            halfLifeDays: 180,
            expiredAtDate: "2024-03-13",
            freshnessScore: 4,
            status: "STALE",
            liveTruth:
              "The European Parliament approved the EU AI Act on March 13, 2024. The regulation officially entered into force on August 1, 2024, with prohibited AI bans applying starting February 2025.",
            correctedReplacement:
              "The European Union AI Act entered into legal force on August 1, 2024, with phased enforcement starting February 2025.",
            adjudicatorReasoning:
              "European Commission official legislative portal confirms the AI Act passed full parliamentary approval in March 2024 and entered into force August 2024.",
            sources: {
              create: [
                {
                  title: "European Commission: AI Act Enters Into Force",
                  url: "https://ec.europa.eu/commission/presscorner/detail/en/ip_24_4130",
                  domain: "ec.europa.eu",
                  publishedDate: "2024-08-01",
                  snippet:
                    "The European Artificial Intelligence Act enters into force today, 1 August 2024. Most rules will apply on 2 August 2026, with bans taking effect after 6 months.",
                  relevanceScore: 0.98,
                },
              ],
            },
          },
          {
            claimIndex: 2,
            originalSpan:
              "Deterministic finite automata recognize regular languages without internal backtracking.",
            category: "STATIC",
            halfLifeDays: 99999,
            expiredAtDate: "NEVER",
            freshnessScore: 100,
            status: "FRESH",
            liveTruth:
              "Fundamental theoretical computer science theorem proven by Kleene (1956). DFA exactly recognizes Chomsky Type-3 regular languages.",
            correctedReplacement:
              "Deterministic finite automata recognize regular languages without internal backtracking.",
            adjudicatorReasoning:
              "STATIC Category: Search-Skip Optimization applied. Timeless automata theory invariant.",
            sources: {
              create: [
                {
                  title: "Search-Skip Optimization (STATIC Fact Bypass)",
                  url: "https://halflife.internal/search-skip",
                  domain: "halflife.internal",
                  publishedDate: "PERMANENT",
                  snippet:
                    "Timeless theoretical computer science invariant. Tavily search skipped, saving 420ms of round-trip latency.",
                  relevanceScore: 1.0,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Seeded 4 Specimens Successfully:`);
  console.log(`   1. [${spec1.slug}] ${spec1.title}`);
  console.log(`   2. [${spec2.slug}] ${spec2.title}`);
  console.log(`   3. [${spec3.slug}] ${spec3.title}`);
  console.log(`   4. [${spec4.slug}] ${spec4.title}`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
