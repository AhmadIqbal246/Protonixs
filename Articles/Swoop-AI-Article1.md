How I built a multi-tenant AI chatbot, with per-tenant isolation

Customers should never accidentally access data for different customers. Below I explain my method for tenant isolation, and also the migration and my honest view on where my isolation could yet be improved.

URL Slug

/multi-tenant-ai-chatbot-per-tenant-data-isolation

Keywords

multi-tenant AI chatbot

per-tenant data isolation

Pinecone namespace isolation

prevent cross-tenant data leakage

multi-tenant RAG chatbot

secure RAG

tenant isolation in vector database

AI chatbot data privacy

Introduction

Many businesses use our platform, which all share a common back-end. Each business has its own AI assistant, which is populated by web-scraping. Customers' assistants must never access data for other customers.

Whilst problems such as an AI chatbot crashing are very noticeable, often more worrying are non-obvious errors. For instance, a chatbot may incorrectly use customer B's data when it should be using that for customer A. Frequently, this will go unnoticed, and is only discovered by a person analysing the chatbots responses.

This was key to my thinking from the outset and my solution was built around this. I will now elaborate on my tenant isolation method.

Put simply, in my multi-tenant RAG chatbot, a tenant is identified by a domain name. Each tenant has its own Pinecone namespace created from the normalised form of the domain name. Data can only be retrieved from within a tenant's namespace. During reindexing, previous common index and a tenant's namespace data are both deleted in an atomic operation. Furthermore, I have a central normaliser which produces a tenant key. As discussed, below I also honestly assess where my tenant isolation can be further improved.

Non-Obvious Errors > Obvious Errors

Whilst many focus on multi-tenant authentication, this is appropriate. However, for me, my real concern is around data retrieval. Despite perfect authentication, if I incorrectly retrieve data for the wrong tenant then my AI model will happily provide outputs which use this. It has no understanding of which data is appropriate and simply uses what is shown to it.

Therefore, I am guided by the principle that I must never show data from another tenant to my AI model. As aforementioned, isolation must be applied both to data retrieval and to authentication.

Initial Method

I originally used a single Pinecone index. As before, this functioned well. All data was included here and each data point had a `source_base` meta-data field denoting which customer it was for. Data for ‘this-domain’ was then retrieved by filtering on this.

Whilst a common index with filtering is acceptable, there are various ways in which this might not work. Incorrect filtering may result in data from another tenant being retrieved. Poor reindexing can mean that older data is not fully removed. Typing errors can be made in a domain name and so inappropriate data can be requested. Finally, old and new data can become entangled. Again, predominantly these are non-obvious.

I did not want users to have to apply filters on an ongoing basis.

Physical Tenant Namespaces

Namespace = Normalised Domain

Within my system, a tenant is related to a domain. The Pinecone namespace is then the normalised version of this. My `normalize_to_domain` function strips away a URL and host's scheme, port, ‘www’, path and trailing slash to normalise. Importantly, I do not myself analyse host names as this could result in varying normalisation and thereby affect isolation.

Only a tenant's data is held within its namespace. Similarly, only data from within a tenant's namespace can be retrieved. Thus there is no common area where data could accidentally be searched.

Atomic Data Removal

During reindexing I need to ensure that old data is not retained. Initially, `delete_by_domain` is used to remove all data for a tenant. This encompasses both old data from the common index (with a filter for `source_base == domain`) and all data from within the `namespace=domain`. Moreover, each data item's metadata is supplemented with `source_base`. New data is then stored within a tenant's namespace.

Intentionally, I still utilise the data removal operation. Although new data retrieval is namespace dependant, previously data was also stored in a common index. By removing both old common index and namespace data I guarantee that old data will not be retained in the old way during reindexing. Although my `get_base_url_filter` helper function still exists, current data retrieval is primarily namespace dependant.

Tenant Namespace Data Retrieval

A visiting person's host is analysed to ascertain which namespace to utilise. This host is normalised by `normalize_to_domain(context_url)`. For localhost previewing, `target_domain` (also normalised) is also analysed. Similar to above, only data within the designated namespace is then similarity searched (for `k=30`). Subsequently, duplicate data is removed and items are re-ranked and marked with a score. Data is then cut to fit within a token limit. Throughout this process, again, only a tenant's data is dealt with.

Tenant Keys Isolation

Alongside data, tenant keys are also isolated. Only a tenant's key will be returned by `get_api_key(domain)`. Bring-Your-Own-Key (BYOK) keys are encrypted and stored in Postgres using Fernet. They are prefixed with `ENC:`. These keys are also stored in a Redis hash, indexed by domain. A tenant's LLM employs its key (or if no key exists, the default platform demo key). Importantly, it never accesses another tenant's key. Moreover, domain specific rate and demo usage limits are also domain dependant.

Key Facts

I aim to be accurate. The below has been directly taken from my code and has not been derived from any testing.

Post-retrieval from a tenant's namespace (for `k=30`) Cohere re-ranks data and selects the top ten items. Low-scoring data is excluded. Around three thousand five hundred characters is the maximum amount of context, usually representing about three hundred words. Data is divided up by markdown headings and blank lines. Each section is tagged with `[SOURCE | PAGE]`. The namespace string for a domain is perpetually formed by `normalize_to_domain`. Chats are identified by a `session_id` and are not cross-tenant. Chat details also include domain information.

Whilst I could state that, for example, ‘within a test of N tenants, there was zero cross-tenant data leakage’, (which I have not tested), I can assuredly say that my system prevents non-intentional cross-tenant data retrieval. Plus, reindexing guarantees that old data is atomically removed. The following section discusses where further possible issues could arise within a live system.

Areas For Improvement

I believe it is important to be open.

Although my `/chat` endpoint is unauthenticated, my code does check a registry and issues a warning. Nonetheless, the accompanying `raise 403` is currently commented out. Tenant data is derived from both a customer's `context_url` and `target_domain`. Someone could in theory enter another tenant's domain as their `target_domain`. Data would then solely be retrieved for that tenant. Again, physical tenant isolation prevents non-intentional cross-tenant data retrieval. Yet this in itself does not guarantee that only the right person can access a tenant. Registration and domain web-scraping procedures enforce per-account restrictions. Chatting does not.

There is in addition a localhost exception. If `context_url` is for localhost then `target_domain` is analysed. Even though this is for previewing, it can cause a discrepancy between a visitor's host and the `target_domain`.

Previously there was also a global path. The global vector store can still be accessed via `get_vector_store()`. Old data is again removed during reindexing. Although namespace data retrieval is now used, the global store still exists. My code recognises that previously this was supported. However, I trust people will never store sensitive information within the global store.

Proper tenant isolation is reliant on `normalize_to_domain` producing the same key. Should two tenants ever normalise to the same domain string, they would effectively merge into one tenant (as they would share the same namespace). Hence, this function is very significant.

What's Next?

Redo verification of `/chat` tenant ownership. This should involve checking that a domain is registered and that a customer is permitted to use it. Tenant data should then be server-side derived from this verified registration. Both tenant and keys should be associated with this verified identity. Remove the localhost exception for live systems. No longer default to a global namespace for tenant chatting. Add in checks to ensure tenants cannot access each others data. Should regression happen, it will then be readily identifiable.

Conclusion

For a multi-tenant AI service, tenant isolation is not an optional extra. Rather, it is central. Without the confidence to manage what an AI model can access, all other protection mechanisms are founded on uncertain ground. Physical tenant namespaces, atomic data removal, a central source-of-truth for tenant keys and solid verification of who is querying are all key to ensuring that one customer's data is not accessed by another's chatbot.

Outputs

Article Title

How I Built a Multi-Tenant AI Chatbot With Per-Tenant Data Isolation

Meta Description

A multi-tenant AI chatbot is only safe if a customer can never accidentally access another customer's data. Here is precisely how I isolate tenants within my RAG system, together with my migration and my honest areas for improvement.

URL Slug

/multi-tenant-ai-chatbot-per-tenant-data-isolation

Keywords

Main

Multi-tenant AI chatbot

Per-tenant data isolation

Pinecone namespace isolation

Supporting

Prevent cross-tenant data leakage

Multi-tenant RAG chatbot

Secure RAG

Tenant isolation in vector database

AI chatbot data privacy