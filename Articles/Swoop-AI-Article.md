How I Built an AI Chatbot That Only Answers From Your Website

Fed up of AI assistants making up information, I set about building my own which doesn’t. I have implemented several techniques – website crawling, chunking, vector search and re-ranking along with a restrictive prompt – to ensure my AI remains accurate.

/how-i-built-ai-chatbot-that-only-answers-from-website-content

AI chatbot that answers from website content

RAG chatbot

Website AI assistant

Build a RAG chatbot with Pinecone

OpenAI GPT knowledge base chatbot

Crawl4AI chatbot

Embeddable AI chatbot for business website

---

I had both a website and an AI assistant to answer queries relating to it. Unfortunately my initial attempt was terrible.

Whilst the assistant was happy to answer, it often made up information – for example prices, services and policies. And it did so in a very polite manner. Somehow this was even more worrying.

Neither I nor those I built this for could trust it.

So I redesigned my offering. This second iteration can do something that is not well executed by many AI products. It can only answer based on the information on your website. Should it not find information, it will inform you.

No made up information. No common sense filled in.

Below is my story of how I created this, warts and all.

This offering is named Swoop AI. Basically, it is a platform that provides AI assistant functionality to any website. Simply type in a URL and the site is crawled. Content is indexed. Finally, a ‘chat bubble’ is embedded onto your website. Again, this can only provide answers based on the information found on the website.

There are a number of services utilised within my offering. Firstly, a backend built using FastAPI. This in turn communicates with a frontend created with Next.js. A Celery task runner is used for processing. State is stored within both Postgres and Redis. Pinecone is my vector database and I use Cohere for re-ranking. Finally, I utilise a language model which varies according to who is querying.

In short, my offering can be broken down into six stages. Sites can be crawled. Information can then be processed and chunked. These chunks are embedded and stored in a vector database. Appropriate information is retrieved. This is then re-ranked. Finally, the best information is passed to a language model. Along with this information is a prompt to ensure that the language model only uses the information I provide.

Chatbot That Made Up My Pricing

Initially, I aimed to create a basic version of my offering. Input a URL. Retrieve information from the website. Provide answers to queries. Unfortunately, I had it backwards. Rather than the crawling process being the most complex part, it was in fact all the other elements which presented difficulty.

Pages were crawled and text was chunked. These chunks, along with a query, were then provided to a language model. This model had access to all of the internet (or at least appeared to).

The responses were very slick. Unfortunately, again, they were incorrect. For example, the model would state "Yes, we offer same day service." However, such a service, and even a delivery section, did not exist.

Even more concerning was that the language remained consistently and soothing. Calm, yet incorrect information is even more worrying than that which is assertive and inaccurate.

Again, rather than making one change, I implemented six different alterations.

Prior to further analysis, I also analysed the financial aspects of my offering. As embeddings are processed on-site using Hugging Face, expenditure remains limited. Significantly though, the true financial burden relates to language model querying. As I am utilising a bring your own key language model, the offering itself does not incur any costs for inference.

Furthermore, my original offering lacked significant history functionality. Again, I had not progressed this far. I had successfully reached the query answering stage, but the answers were still inaccurate.

Why My Initial Offering Wasn’t Sufficient

During my initial development, I largely bypassed processing. I had also utilised a generic crawler. Consequently, along with desired information, the crawler was returning superfluous data – for example cookie statements, menus and footer text.

Text was then chunked. However, I had divided this by paragraph rather than section. Therefore, chunks could straddle two paragraphs, one containing part of an answer and the other containing part of a following answer.

Information was then retrieved via a simple similarity search. Unfortunately, the most similar result was not always correct.

Finally, my language model was prompted in the standard manner. There were no restrictions on the information it could utilise.

Although each individual issue was not major, collectively they transformed my offering from an assistant to a fabricator.

Redevelopment

Crawling

I selected Crawl4AI to crawl websites. Crucially, this tool employs a headless browser. Many business websites are structured as React applications and so merely provide an empty template for you to fill in. Without a headless browser, I would have lost a week of development time.

My deep crawl utilised a breadth first approach. Initially, the homepage was crawled and then links followed. I restricted the depth to two and limited the number of pages to one hundred and fifty.

Furthermore, I retrieved URLs from a sitemap. Frequently, websites contain large quantities of pages. Simple link following from a homepage will therefore generally fail to capture sufficient pages.

Within my filtering process, pages are firstly restricted to those belonging to the relevant domain. Secondly, pages relating to login and account management, shopping carts, checkouts and file downloads are excluded.

Legal pages are also excluded. You wouldn’t want your AI assistant to engage in a discussion about your privacy policy, for example, when a customer is in fact seeking information regarding their refund rights.

Cleaning and Chunking

Whilst the raw markdown produced by the crawler was improved upon, further processing was still necessary.

Chunking was achieved by dividing text at markdown headings and empty lines. This maintains the association between a heading and its related thoughts.

A trail is then added to each chunk. This comprises of both the URL and page title. Again, this enables the language model to reference appropriate information.

Chunks are approximately three hundred words in length. Should a paragraph exceed this limit, a new chunk is commenced. Indeed, I also disregard small chunks as these lack real meaning.

Searching and Re-ranking

Vectors are stored in Pinecone. Each namespace corresponds to a domain. As such, data relating to one client is never mixed with that of another. This was fundamental to my offering.

Whilst metadata filters are available, I deliberately opted for namespaces. Although I recognised that such filters could be used, I felt that true separation was better achieved through namespaces.

Similarity searching is undertaken. The top thirty results are then re-ranked using Cohere. The top ten of these are returned.

Chunks scoring highly are selected. Furthermore, I restrict the volume of context provided to the language model to approximately three thousand five hundred characters. This meant that I had to effectively search for, and not simply input all of a website’s information, in order to remain within this limit.

Prompt

Undeniably, a great deal of my effort was invested in this area.

Initially, my system prompt establishes a knowledge blackout. The language model must not possess any information about the website other than that which I provide.

Secondly, my prompt enforces a zero hallucination rule. Should information relating to pricing or services not be present within my context, this must be communicated. Common sense should never be used to supplement missing information.

Further guidance within the prompt dictates the tone of my assistant. It should represent the business and so ‘we’ and ‘our’ are used. References to documents and/or databases are never mentioned. Particular attention is given to numerical data. Sources are referenced where required.

Finally, my language model operates at a low temperature of zero point one. Certainly this helped although the prompt was largely responsible for the outcome.

Deploying The Widget

The frontend is a basic JavaScript code snippet. It is served through an API route. It accesses a configuration object and deploys a chat bubble. Tokens are streamed from the backend using server sent events.

My assistant can be re-branded within my dashboard. This includes theme, text and heading colours.

Significantly, there is also an instruction which, when clicked within the chat bubble, will reveal my offerings admin panel. The owner can then amend my API key without having to exit the chat.

Important Metrics

I feel it is essential that I share metrics with you. Vague information is to be avoided.

Approximately three thousand five hundred characters (around eight hundred and seventy five tokens) was the maximum volume of context that could be provided to my language model. Answers had to be formulated within this limit.

Whilst initially a basic similarity search was performed, this was later followed by re-ranking. Of the top thirty search results, the top ten were returned by the re-ranker.

Chunks are approximately three hundred words in length.

My language model operates at a temperature of zero point one.

These metrics are ones that I can confidently share as they can be traced back to my code.

Numerical restrictions are also in place. Five queries per minute can be submitted to my chat endpoint. Ten can be submitted within a session chat. Five queries per minute can also be issued during a crawl.

Within my demo offering, five, twenty five and fifty chats can occur per domain for my free, pro and business plans respectively.

My vector search has a twenty five second time out. My language model has a forty five second time out. Finally, my crawler has a sixty second page time out.

Areas Of Limitation

As mentioned above, nothing is ever truly complete.

Whilst my default crawl process goes to two depths and collects one hundred and fifty pages, most marketing sites are adequately covered. However, sites with extensive documentation are not.

Only one website can be entered on my free plan. Within my demo offering, five chats can occur per domain.

Sites which are frequently updated or which feature extensive documentation structures are poorly suited to my offering.

Going Forward

I would look to enhance my offering so that it can better manage substantial volumes of information. I would also endeavour to improve subsequent querying and develop the ability to pass sub-queries to my retriever.

Key Learning

As mentioned, the integrity of my assistant is reliant upon that of my pipeline. Despite an excellent prompt, it was not solely this which ensured accuracy. Equally important was my decision regarding what not to supply to my language model. Hence, my retrieval process.

---

Final Output

1. Optimised Article Title

How I Built an AI Chatbot That Only Answers From Your Website

2. Meta Description

Fed up of AI assistants making up information about a website, I developed my own which does not. Below I explain how I created my offering. I have utilised website crawling, chunking, vector search, re-ranking and a restrictive prompt to ensure my AI remains accurate.

3. Suggested URL Slug

/how-i-built-ai-chatbot-that-only-answers-from-website-content

4. Primary and Secondary Keywords

Primary

AI chatbot that answers from website content

RAG chatbot

Website AI assistant

Secondary

Build a RAG chatbot with Pinecone

OpenAI GPT knowledge base chatbot

Crawl4AI chatbot

Embeddable AI chatbot for business website