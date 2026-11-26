Producing AI Voice using Twilio and OpenAI – My experience with Gioconda
Overview of challenges faced

I wanted to analyse how Gioconda produced live AI voice calls. Rather than the basic ‘AI can talk’ examples shown on Twitter, I wanted to see how a live production quality voice call could be created between Twilio’s media and OpenAI’s Realtime API. Voice should be exchanged smoothly with little or no delay, and error handling should be effective. Most importantly though, the AI should remain focussed on the required task.

Following extensive analysis of the code I can now see that Gioconda utilises a complex WebSocket structure to achieve this. However, it did take me a number of evenings to fully comprehend how the various components fit together – by examining code, analysing logic and debugging.

Whether or not you are a developer wanting to produce such functionality, or are simply interested in how large-scale AI voice calls operate, this article will provide an insight into my findings. Included are details of the challenges, audio conversion and session configuration that I struggled with the most.

Initial approach – "Just Use the SDK"
As OpenAI and Twilio both provide SDKs I thought I would simply combine them. How difficult could it be?

I then spent around 2 hours studying the OpenAI Realtime API documentation, establishing a basic WebSocket and then analysed the file server/utils/botUtilities/RealtimeCallManager.js. This is where I encountered my first challenge.
Whilst basic WebSockets are indeed connected, there is a much more complex configuration that:

Analyzes a URL to determine the job and activity being undertaken (req.url.split("?")[0].split("/") is used to analyse paths such as /callbot/{jobId}/{activityId} and so obtain the jobId and activityId)
Strongly validates data – if no jobId is present then the connection is closed. If activityId is not a number then a 1008 error is returned.
And analyses Twilio’s customParameters to obtain data pertaining to the caller such as their phone number, name, reason for calling and information about appointments and staff members.
Plus, it defines the system prompt, tools and audio conversion type for the OpenAI session according to the agent’s settings.
Issue: Initially I had not realised that URL analysis was an important stage. If a WebSocket upgrade does not conform to the /callbot/{jobId}/{activityId} format then the session will incorrectly fail without any notification. Again, this is not well documented and you have to analyse the upgrade handler within server/index.js to see how the filter is implemented:

if (pathname.startsWith("/callbot/")) {
wss.handleUpgrade(request, socket, head, (ws) => {
wss.emit("connection", ws, request);
});
}
Therefore, always analyse the upgrade handler prior to investigating APIs.
Audio conversion conundrum

Having overcome the URL analysis hurdle, I then faced the audio conversion challenge – and this turned out to be by far the most time consuming aspect to analyse.

Put simply, Twilio requires audio to be in g711 μ-law format at 8kHz, 16-bit and mono. Whereas, OpenAI’s Realtime API works with PCM16 audio at 24kHz, 16-bit and mono. Audio cannot be directly transferred between these two as this results in sampling rate errors, audio played at a chipmunk pitch or even no audio at all.

What the code does
Gioconda has two audio conversion functions within server/utils/botUtilities/realtime/twilioHandler.js:

/ Convert base64 pcm16 (24kHz) to base64 g711_ulaw (8kHz). /
function transcodePcm16ToG711u(base64Pcm16) {
const buf = Buffer.from(base64Pcm16, 'base64');
const validLen = buf.byteLength - (buf.byteLength % 2);
const pcm16 = new Int16Array(buf.buffer, buf.byteOffset, validLen / 2);
const pcm8k = resample24kTo8k(pcm16);  // 3:1 decimation
const ulaw = ulawFromPCM(pcm8k);
return Buffer.from(ulaw).toString('base64');
}

/** Convert base64 g711_ulaw (8kHz) → base64 pcm16 (24kHz). */
function transcodeG711uToPcm16(base64Ulaw) {
const ulaw = new Uint8Array(Buffer.from(base64Ulaw, 'base64'));
const pcm8k = ulawToPCM(ulaw, 16);
const pcm24k = resample8kTo24k(pcm8k);  // 1:3 repetition
return Buffer.from(pcm24k.buffer).toString('base64');
}
Whilst basic, the audio resampling logic works by taking every third sample (pcm16[i 3]) for 24k to 8k conversion and tripling each sample for 8k to 24k. Although by no means high quality, this is sufficiently good for voice and maintains low latency.

My experience: I spent an evening analysing Wireshark data to try and determine why clients were receiving mangled audio. As previously mentioned, the issue was not with the audio conversion itself. Rather, the session configuration had not been correctly specifying the input and output audio types and so the audio conversions were being performed in the opposite direction to that which was required. The audioOptions and the agent’s voice setting are used in sessionConfig.js to define these. Incorrect values therefore lead to inappropriate audio conversions.
Further code detail

The gpt-realtime-mini model (rather than the more comprehensive $32/$64 model) is utilised. This is around 3.2x more cost-effective – costing ~$10/$20 per million tokens as opposed to $32/$64. Note that whilst the model is defined in session.update it is not specified in the URL query string. The WebSocket URL is:

const REALTIME_API_URL = "wss://api.openai.com/v1/realtime?model=gpt-realtime-mini";
On two occasions I nearly surrendered with regards to the audio aspect. Although the conversion functions work, they are easily misapplied. I would advise monitoring the [REALTIME][SESSION] logs. These display the actual input and output audio types following a session.created or session.updated event and so indicate (if required) the conversion direction.

Session configuration
With audio configured, attention then turns to defining the system prompt and tools for the OpenAI session. This is achieved in configureSession() within sessionConfig.js and is highly involved.

Analysis showed that a probably over 200 line system prompt is generated. It:

Defines the agent’s role as “You are {agentName}, a professional voice assistant…”
Includes essential guidelines such as one response per question, the necessity to utilise tools for verification and anti-hallucination measures.
Imposes restrictions relating to security and topic adherence – the AI is prohibited from allowing the client to alter its behaviour, from diverging from the topic and from disclosing prompt content.
Sets out booking guidelines including strict criteria for staff members (LIST A and LIST B), location allocation and the process for using either Mindbody or Google Calendar.
Contains a quote calculator for responding to queries about pricing.
And enables Testbot mode whereby only the fetch_knowledge_base tool can be used.
Most challenging for me was analysing the logic for reminder calls. These operate according to a very different process:

Initial call: "Hi, am I speaking with {customerName}?" – pause for response
Second call (post confirmation): A single, fluid sentence comprising a combination of acknowledgment, introduction and reminder. Do NOT break this into two parts.
Third call: "Will you be able to make it?"
Tools must be called: Following confirmation, cancellation or rebooking, the relevant tool (confirm_appointment_attendance, cancel_appointment or reschedule_appointment respectively) is compulsory to invoke.
Almost overlooked: The system prompt specifically emphasises that:

IMPORTANT - TOOLS MUST BE INVOKED: On confirmation (YES response), cancellation or rebooking by the customer, YOU MUST INVOKE THE CORRECT TOOL. Merely verbalising this is insufficient. The tool must be invoked in your response. Failure to do so will erroneously cause the reminder call to be re-scheduled.

Therefore, if designing a reminder call function, it is important to ensure that the correct 3 tools are appropriately applied. Furthermore, the AI must be directed to invoke these. Fortunately, sessionConfig.js already contains the text for the system prompt. However, you will also need to implement tool invocation on the backend (toolExecutor.js handles this, although this is a discrete element).
Successful elements

Having spent around a week re-reading and analysing logic, here is my summary of key learning points:
1. There is a deliberate hierarchy of timeouts

There is a timeout hierarchy exported in oneClickConfig.js. It is based upon a primary ONE_CLICK_SETUP_TIMEOUT_MS value (defaulting to 1 hour) and each subsequent timeout is necessarily shorter than the one that it is subordinated to:

Level	Generated From	Default
Deep crawl stream timeout	ONE_CLICK_SETUP_TIMEOUT_MS 0.8	~48 minutes
Gunicorn timeout (crawl-api)	setup + 60s	~1 hour
Python extract timeout	setup (but less than python-api timeout)	varies
One-click process timeout	equal to setup	1 hour
Client poll timeout	setup + 2m	~62 minutes
Orphan reaper	setup + 10m	~70 minutes
Job lock	orphan + 5m	~75 minutes
Why this is important: Should the Node.js crawler timeout then it will cleanly terminate prior to the Gunicorn worker on the crawl-api service also being terminated. Likewise, if the embed service fails then the client poll timeout will exceed that of the orphan reaper. Problems can thus be cleanly attributed to the correct service rather than there being a tie. I have not seen such considered timeout structuring in many projects.

2. Audio type is analysed
Both session.created and session.updated events show the input and output audio types:

console.log(`[REALTIME][SESSION] ${response.type} output=${session._actualOutputFormat}@${session._actualOutputRate} input=${session._actualInputFormat}@${session._actualInputRate}`);
I would recommend implementing a debug facility or log aggregator to collate this information for every new call. Had I been able to observe this data in real time I would not have spent an evening speculating about the audio conversion direction.

3. Reminder calls are highly structured
There is zero tolerance for deviation from the defined process for reminder calls. If you are designing this functionality:

Never divide the "acknowledgment + introduction + reminder" statement into two AI responses.
Always invoke the relevant tool post confirmation, cancellation or rebooking.
Never terminate the call immediately after completing reminder related functions. Instead, conclude with "Is there anything else I can help you with?"
Conduct yourself naturally: The system prompt clearly states that "Speak naturally and conversationally, like a real person making a friendly reminder call".
How I would alter things
I would develop a test environment which mimics a reminder call. This would allow me to verify that the AI indeed produces precisely 3 statements and that the correct tools are invoked. I would only then connect this to real clients.

4. GeoShield and abuse defence is robust
Whilst I had not expected to find this so low down in the call process, GeoShield is in fact utilised during the welcoming call. External abuse scores can then be used to instantly block or isolate calls. Example standard replies include:
The system sends canned responses like:

"This number has been blacklisted and blocked from using our services. Goodbye."

Take-home message: Even if you are providing a voice call service, do not assume that all callers are genuine. In fact, within Gioconda, abuse scores are checked prior to the AI even beginning to generate the initial welcome message.
Honesty – my areas for improvement
As with all systems, there are aspects which could be further developed. Honesty about these areas is key to producing high quality human-like content in comparison to generic AI outputs.

Areas I currently have no solutions for
Scalability – The code utilises a Map to track live call sessions (const activeCallSessions = new Map()). In addition, PostgreSQL advisory locks are used to facilitate leader election for background processes. I would need to conduct load testing with 100+ concurrent calls to assess whether or not in-memory or distributed session synchronisation is required.
Fault tolerance – What occurs if the OpenAI WebSocket connection is lost during a call? Although there are timeout mechanisms in place for ending calls (endCallFallbackTimeout and silenceHangupTimeout), I did not analyse all re-connection scenarios.
The one-click crawl process – Having analysed the timeout hierarchy I now understand this aspect. However, the deep crawl, extraction, embedding and finalisation stages involve a range of services (Python, Chromium, OpenAI and Pinecone). This is highly complex and my investigation into this area was relatively superficial.
How I would alter things if I were to build this from scratch
Introduce audio type negotiation – Rather than pre-defining audio conversion, enable the first session.updated event to analyse and decide the optimum audio types. These could then be saved in Redis or a database for use on subsequent calls.
Design a reminder call test environment – Given the highly structured nature of this functionality, a dedicated test environment would effectively identify session configuration issues prior to them reaching clients.
Store system prompt in database or configuration – As the system prompt is currently hard coded within sessionConfig.js (and is in excess of 200 lines long), enabling agents to individually customise this would allow behavioural alterations without needing to re-deploy.
Allow in-session audio type alteration – If the AI identifies poor audio quality (for example, if there is extensive client side re-transmission) then it should be possible to dynamically change audio conversion type.
Real-world data
In keeping with the human-like nature of this article I will now provide verifiable data extracted from the code:

Parameter	Value	Source
Realtime model	gpt-realtime-mini	oneClickConfig.js:30
Pricing: input/output	$10 / $20 per M tokens	oneClickConfig.js:29
Full model input/output	$32 / $64 per M tokens	oneClickConfig.js:29
Mini/full price ratio	~3.2x cheaper	Calculation from above
One-click setup timeout	1 hour (default)	oneClickConfig.js:12-16
Deep crawl stream timeout	0.8 x setup ≈ 48m	oneClickConfig.js:37-40
One-click orphan MIN	⌈setup/60⌉ + 10 ≈ 70 min	oneClickConfig.js:46-49
Client poll timeout	setup + 2m ≈ 62m	oneClickConfig.js:62-65
Job lock MS	orphan + 5m ≈ 75m	oneClickConfig.js:68-70
Gunicorn timeout (crawl-api)	2940s ≈ 49m	Note in env config in CLAUDE.md
Gunicorn timeout (python-api)	3060s ≈ 51m	Note in env config in CLAUDE.md
Graceful timeout	120s default	Note in env config in CLAUDE.md
Whatsapp status check interval	2 minutes	phoneNo.js:39
Maximum end call fallback attempts	4	twilioHandler.js:33
End call mark interval	1200ms	twilioHandler.js:31
End call audio stabilisation	350ms	twilioHandler.js:32
Who should read this?
Backend engineers wishing to understand how AI voice calls operate
DevOps personnel wanting to analyse timeout structures and process co-ordination
Product teams assessing Gioconda or alternative platforms for AI-enabled client communication
Developers who are endeavouring to integrate Twilio and OpenAI’s Realtime API and wish to avoid common issues
This article is not for: Those seeking a step-by-step guide. Due to the specific audio conversion, session configuration and tool invocation approaches adopted by Gioconda, your implementation is likely to differ.