How SafeBill’s Escrow works

Only paying for work following approval

SEO Title: How SafeBill’s Escrow works

Meta Description: Discover more about how SafeBill’s escrow service works, including staged payments and approval along with Stripe Connect. Additional takeaways are provided.

URL: /how-safebill-escrow-system-works/

Key topics: escrow, freelance escrow, staged payments

Additional topics: SafeBill, Stripe Connect, freelance marketplace, payment, dispute.

How SafeBill’s Escrow works

Whilst not because of poor quality, I frequently find that good freelance work is lost due to payment issues. Either the seller fails to get paid or alternatively the client pays in advance and the seller does not then provide what was agreed. Neither outcome is desirable.

Having experienced this as both a seller and a buyer I created SafeBill. I made the right choice in centre-pinning this around the payment function. As a result, the conversation functionality was easily developed. However, payment was more challenging.

Within this blog post I describe how our payment functionality was developed for SafeBill. Including my original ideas, what did not work and then what did. I also candidly analyse how far we went with our payment functionality. Please note that I am not neutral in my analysis as I have analysed the source code.

In short;

Following a client’s approval of a quote, a sum equal to the quote is placed into escrow. Once a seller has completed a stage, they ask for payment. This is then approved by the client. Payment is then released from escrow. Following this there is a seven day interval and then payment is made into the seller’s Stripe Connect account.

Requirements

Please note that to fully understand this blog post, you will require:

A seller (or professional buy-er) SafeBill account.

A Stripe Connect account, linked to your SafeBill profile.

A quote (PDF) for the project you wish to develop.

Some knowledge of Django, Django REST Framework and Stripe to analyse our backend code.

This blog post targets those selling within the marketplace and also developers interested in analysing how our marketplace processes escrow payment releases.

What is SafeBill?

It is a marketplace for professionals. Clients search for and ask for quotes from professionals. Clients then pay for a professional’s work. Professionals in turn perform work and are paid for it. Rather than clients making payments directly to professionals, money is escrowed by the marketplace. This is then released by the client for each stage of a project.

Our backend is based upon Django 5.2.4. Within this we utilise the Django REST Framework, Channels, Celery, Redis and PostgreSQL. Stripe is also used for payments. Our frontend is built using React 19, Vite, Tailwind CSS and Redux Toolkit. As indicated above, I am focusing on our backend as this is where our escrow functionality is developed.

More information about our backend features can be found in the Django and Stripe Connect documentation. See [Database queries](https://docs.djangoproject.com/en/5.2/topics/db/queries/) and [Stripe Connect documentation](https://stripe.com/docs/connect). I have personalised information from these resources for SafeBill. Our implementation is our own.

My original idea was not correct

Originally we had a generic method for releasing payments. Once a project was deemed to be complete, the full quote monies would then be released. Sellers would ask for money to be released and this would then be approved by a client.

Nevertheless, after approximately three evenings’ work on this I realised this was not suitable.

Although projects can be perceived as singular items, in practice they are often broken down further into stages. For example, a re-design project may have three stages. Likewise, a build project might have set up, build and handover stages. Using my original generic method of payment release, sellers could either invoice for and/or deliver a project in one transaction. However, single delivery is not as favourable as it prevents a client from identifying and rectifying issues at an early stage. Moreover, sellers are unable to charge for specific portions of work.

Although not a typo, this approach was fundamentally incorrect. We had assumed that one invoice would be issued for a project. Our database, API and frontend all adhered to this. However, when I attempted to break a project into stages, my code did not support this. Further, our payment approval functionality was not able to recognise partial approvals. Moreover, our escrow functionality was unaware that money was being escrowed for stage two (for example) even though stage one had not yet been approved.

Therefore, I began again.

Adding stages

This time we re-designed our payment release process, this time basing it on a quote.

Quotes are PDF documents which sellers upload. Each quote is specifically attached to a project. An automatic invoice reference is then generated for the marketplace. This is in the format of ‘year-number’ e.g. 2026-0001.

Following client approval of a quote, they deposit money into escrow. This is then escrowed by the marketplace and is released as appropriate.

Quotes can then be further broken down into up to three stages. Each stage has a heading, description and monetary value. Sellers complete a stage and then request that money be released. This is then approved by the client.

On approval of a stage, the marketplace releases the applicable amount of money from escrow. Sellers then receive this money, minus the marketplace’s fee. This is a percentage-based charge which defaults to seven percent. Additionally, VAT is also charged. Our default VAT rate is twenty percent.

All of this is viewable by the client, within their dashboard. As sellers complete stages, the client can observe this. Should sellers consider that a stage is complete, the client is informed. They can then either approve or ask that the stage be edited. This is central to our product.

Whilst I had previously thought that breaking a project into stages was the major difficulty to overcome, in reality it was our payment release functionality which provided the greater challenge. Either sellers or clients can approve payment releases. Successfully designing a process for this, including alerting and status updating, was central to producing a reliable process.

We are especially proud of our re-calculation functionality. Rather than simply adding numbers together, we calculate a client’s money balance by deducting approved payments releases from the total that they have paid. This is done for a client’s entire account. In this way we ensure that our escrow balance is correct.

Money is then transferred seven days after being confirmed as paid. It is first moved onto a seller’s available balance and is then sent to their Stripe Connect account. Stripe then transfers the money within two business days.

Payment release

This area of code was the most labour intensive for me to develop. Here is the central service:

`backend/safebill/payments/services.py`

```python

def process_milestone_payment_with_project(seller, buyer, project, milestone_amount):

BalanceService.release_escrow_funds(buyer, milestone_amount)

payment = Payment.objects.filter(project=project, status="paid").first()

if not payment:

logger.error(f"No verified payment found for project {project.id}")

return False

platform_fee_amount = (

project.platform_fee_percentage * milestone_amount

) / Decimal("100")

net_amount = milestone_amount - platform_fee_amount

BalanceService.update_seller_balance_on_milestone_approval(

seller, net_amount

)

BalanceService.create_payout_hold_for_milestone(

seller=seller, project=project, amount=net_amount

)

return True

```

As the name suggests, this service enables payment release for a project’s stage. It updates the client’s escrow balance. The net money is then added to the seller’s balance. Finally, a delayed payment is created.

The marketplace fee is calculated using `project.platform_fee_percentage`. As mentioned above, this defaults to seven percent. The net money is then calculated by subtracting this marketplace fee from the stage money. Sellers only receive net money and not the gross total.

Typically, a client’s escrow balance should fall and a seller’s balance should increase by the net money. In addition, a delayed payment for this net money is created. Seven days after this payment is created, the money is transferred.

My afternoon’s learning

Most commonly we experienced issues where:

`text`

```

Payment.DoesNotExist: Payment matching query does not exist.

```

Despite requesting a milestone payment release, if there was no payment for the relevant project, an error was raised and false was returned. However, no information was conveyed to the frontend. Sellers therefore clicked ‘approve’ but nothing happened. Likewise, clients did not see any change. We spent an afternoon attempting to investigate why nothing had transpired. I then introduced the `if not payment` statement and added a log message to accompany it.

To avoid the above situation, we ensured that quotes were both validated and paid for prior to sellers requesting payment releases. This is now part of our procedure.

Alongside never sharing keys, we invariably check data. These are essential requirements.

Live data

Below is real data that we use:

Marketplace fee default - 7%

VAT default - 20%

Maximum stages per project - 3

Delayed payment period - 7 days from when money is confirmed as paid.

Stripe payment timing - within 2 business days of money being released.

Bank transfer only if client’s total > 1,000 EUR.

Card and bank transfer if client’s total ≤ 1,000 EUR.

Subscription - 2.50 EUR net per month. 3.00 EUR inclusive of VAT.

For example, if a project has a quoted price of 1,000 EUR and a client subsequently pays 1,200 EUR (incorporating twenty percent VAT), the marketplace fee is seven percent of the gross total. Sellers receive the net money. Assuming there are two stages, worth 600 and 400 EUR respectively, these can then be released individually following client approval. As stages are approved the client can see their escrow balance falling. Sellers’ balances are increased by the net stage money.

I must be candid about my lack of visual material. Sadly I do not have screenshots of our current dashboard. In addition, I do not have authentic server and API cost data. Therefore, the data detailed above is in fact from our code and configuration. Nevertheless, I favour presenting real data of this nature.

Changes I would make

I would allow more than three stages for larger projects. Usually three stages are enough. Yet mandating a maximum of three does prompt early conversations about a project’s scope – which is good. Nevertheless, on occasion, a project really does require five stages.

I would also like the delayed payment period to be variable, according to individual projects. Seven days was an appropriate length of time for us. It provided a good balance between allowing sellers an adequate period and also giving clients time to highlight issues.

Nonetheless, this is not an ideal method for small, fixed-price projects. If there is only one deliverable, one stage is sufficient. Again, the process works well. However, the extra complexity then does not offer good value.

Furthermore, VAT and SIRET assumptions would need to be changed for marketplaces in countries other than France. Although SafeBill is designed for and utilises French business identifiers and has a default VAT rate of twenty percent, this does not apply generally.

Key learning points

Above all, I learnt that our escrow functionality must fit within the existing client-seller communications. There was no need to invent new language. Instead, we needed to incorporate payment approvals.

Whilst I had not expected this to be so significant, I discovered that our re-calculation functionality is extremely important. Far from being purely a financial function, it also serves as a vital protective measure.

Interestingly, clients do in fact want increased control.

Giving clients the facility to gracefully withdraw from a project was successfully achieved.

Questions

If this blog post has saved you an afternoon, or if you have developed similar functionality and would like to discuss this, please add a comment. Which aspect of our payment functionality would you most like to modify?

Relatedly, there is guidance on how to accept a project invitation on SafeBill. Our quote chat functionality also recognises whether a project is purely for chatting or is indeed a project.

About the author

FalconXoft / Protonixs – developers of SafeBill (safebill.fr). I write about payments, escrow and marketplace platforms and share my development knowledge and experience.

Published: 2026-11-26

Last updated: 2026-11-26