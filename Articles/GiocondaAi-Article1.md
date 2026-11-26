Creating 1-click AI agents

Information about the deep-crawl, embedding and 1-click flow within Gioconda.

---

Problem

Initially, I wanted to investigate how the 1-click AI agent creation flow works. According to marketing documentation, the user can load their own content and the system will then automatically divide this, create embeddings, and deliver a trained AI agent. Investigation of the code and data flow has however shown that this process is in fact more complicated.

Having spent several evenings tracing the code through to the `deep_crawl`, `pythonExtractor` and `streamingRawEmbedder` areas I can now confirm that although the flow is automated, the internal setup is highly controlled and has time-out, recovery and state features. Both software and product people may wish to analyse this to both uncover the ‘magic’ and to further understand the technical boundaries. My findings are as follows.

---

Understanding: "It's Just Crawl4ai"

I had originally thought that the Python Flask API (situated in the `/pineconeapi/` folder) probably just called a crawl4ai function and that the Node.js server was then likely to trigger this. This seems a straightforward approach.

Initially I explored the `/pineconeapi/deep_crawl/` and `/pineconeapi/crawl_markdown/` folders in the hope of identifying such a simple flow. But on investigating the Node.js code in `/server/utils/webCrawling/` I realised that the system is in fact more complex.

As well as deep-crawling, there is also a streaming NDJSON flow. A ‘lazy agent’ is only allocated an agent ID once a maximum page number is reached. Moreover, after deep-crawling, a post-crawl flow occurs, whereby pages with `embedded=false` are forwarded onto the embedding section. There is also a parameter `CRAWL_RAW_EMBED_PAGE_THRESHOLD` (default is 50) which determines whether a website is embedded via either curated Q&A or raw crawl4ai markdown.

Unfortunately my Initial Understanding was flawed. Whilst I had thought that the Node.js server simply relayed a deep-crawl command to the Python API and then received back some markdown, I had not identified the concurrency and back pressure controls within the system. These are respectively defined by `RAW_EMBED_CONCURRENCY` (default 2) and `RAW_EMBED_QUEUE_SIZE` (default 100). Nor had I recognised the function `raw_predeleted` which enables the system to skip a pre-deletion stage for pages which have already been stored.

Never assume that a system comprises just a series of relays. Frequently it is the state, plus page and recovery features which are most complex.

---

Deep-Crawl and Embedding

My investigation of the deep-crawl and embedding system resulted in the following conclusions:

1. Node.js

On initiation of 1-click setup, a request is directed to `server/utils/oneClickUtilities/oneClickService.js` where:

- `crawlWebsite()` is run to perform a deep-crawl.

- Progress is shared with the requesting party using `publishCrawlProgress`.

- Details of the progress are written to the PostgreSQL database’s `one_click_setup_progress` table.

Whilst deep-crawling occurs, the `crawlerService.js` file is employed alongside Playwright. Within this file, the values of `CRAWL_MAX_PAGES` (default 3000) and `CRAWL_RESPECT_ROBOTS` are referenced. Crawled pages are then added to the `crawled_pages` table and also streamed to the requesting party in NDJSON format.

2. Page threshold

Now things start to get interesting. During the deep-crawl, page numbers are continually tracked and logged.

```javascript

const getRawEmbedPageThreshold = () => {

const threshold = Number(process.env.CRAWL_RAW_EMBED_PAGE_THRESHOLD || "50");

return threshold;

};

```

Once this number is attained (default is 50 pages), a 'lazy agent’ function is executed:

An agent (and only one) is allocated using `reserveOneClickAgent()`. The agent is assigned a status of `training_status='IN_PROGRESS'` and also has `trained=false`. Sites with fewer than 50 pages will never have an agent allocated. Thus the curated Q&A finalisation method will be used by default.

Therefore,

≤50 pages: An agent will not be pre-allocated. Even post-crawl, the curated Q&A finalisation method can still be used by default.

>50 pages: An agent will be pre-allocated. However, the raw-embed finalisation method must then be used.

3. Concurrent embedding

Whilst deep-crawling, pages are simultaneously streamed to the streaming embedder:

```javascript

const { createStreamingRawEmbedder } = require("../webCrawling/pipeline/streamingRawEmbedder");

```

Using an asynchronous `tryOffer()` function, if the embedder’s page queue is full (maximum size is 100 pages), a page will be dequeued from the stream (although this page will continue to show as `embedded=false` in the `one_click_crawl_pages` table). This page will subsequently be embedded during the post-crawl flow. Therefore, the NDJSON stream will never be impeded by a slow embedder.

For a considerable period I was perplexed as to why certain pages seemed not to be embedded. This is due to the back pressure implemented by `tryOffer()`. If the embedder cannot keep up with the rate of pages coming in then these pages will be marked as `embedded=false` and will then be embedded in post-crawl. Thus even though some pages are embedded post-crawl, the live deep-crawl will never be impeded.

4. Post-crawl flow

There is then a permanent post-crawl flow which is executed:

1. From the permanent table, select pages which have `embedded=false`.

2. Stream these to the embedder. Here, a synchronous `offer()` function is used which will halt if the embedder’s page queue is full.

3. `finalize()` is run to empty out the end of the queue.

4. Pages which were streamed during the live deep-crawl are noted so that they are not re-streamed in the post-crawl flow.

This dual flow ensures that every page is either embedded or explicitly marked as un-embeddable. Plus, it prevents a potential deep-crawl time-out if the embedder becomes slow during the deep-crawl.

5. Switching mode

The key indicator of whether an agent is created using curated Q&A or raw-embedding is given by the boolean `useRawEmbedding = rawEmbedder.isCommitted()`.

If no agent was ever pre-allocated (for small sites (<50 pages)): The agent continues to have either a `training_status` of `PARTIAL` or `OK`. Curated Q&A is therefore utilised.

If an agent was pre-allocated (>50 pages): Only after raw-embedding has been completed will the agent’s status be updated to `OK`|`PARTIAL`.

Whilst an agent has a `training_status` of `IN_PROGRESS` it is temporarily excluded from agent listings.

To summarise then, it is this single boolean – whether or not the embedder has committed – which determines whether an agent is generated using curated Q&A or raw-embedding. This boolean is referenced when agents are listed, viewed in detail and deployed within a test-bot.

---

Time-Outs

The time-out configuration in `oneClickConfig.js` is very impressive. All sub-time-outs are necessarily shorter than their parent time-out. The main time-out is `ONE_CLICK_SETUP_TIMEOUT_MS` (default is 1 hour).