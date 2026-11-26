How SafeBill separates quote chats and real projects

SEO Title: How SafeBill separates quote chats and real projects

Meta description: SafeBill distinguishes between quote chat and real projects. Therefore, only real projects are shown to sellers on their dashboard.

URL slug: /how-safebill-separates-quote-chats-from-real-projects

Keywords: quote chat; separation; SafeBill

Secondary keywords: freelance marketplace; dashboard; Django; real projects; chat only projects

How SafeBill separates quote chats and real projects

My main aim for building SafeBill was to enable secure transactions between freelancers and clients. Nonetheless, the problem we faced was not concerned with money – it was instead related to display.

When a client submits a quote request, a ‘quote chat’ project is created so that the buyer and seller can converse. Projects are shown in an easily identifiable format for example, `Quote Chat: {buyer} ↔ {seller}`. Similar to other types of projects, these are saved in the database. Until recently, alongside real projects, they were also shown on a seller’s dashboard.

This was clearly not ideal. Typically, sellers will have many active projects and furthermore, many quote chat projects. Sellers found it challenging to identify real projects from what could often be unproductive quote chat projects. Aware of this, I devised a way to overcome this problem. Details are explained below.

In summary

Every project has a new project_type field. This can either be `real_project` or `quote_chat`. By default, only `real_project` projects are shown on a seller’s dashboard. Sellers can however choose to see their quote chat projects. As the amendment was not intrusive, only one migration was needed.

To successfully utilise this guide you will need:

A SafeBill seller account.

Basic understanding of Django models and Django REST Framework list views.

Access to the code base (if you want to put this into practice).

Introduction to SafeBill

SafeBill is a freelance marketplace. Buyers can search for and ask qualified professionals for quotes. Payments are processed using an escrow facility. Sellers deliver work for clients and are subsequently paid by clients for this upon completion of mutually agreed stages. The back-end is developed using Django 5.2.4 and the Django REST Framework. Front-end development is undertaken using React 19 and Tailwind CSS.

Although this article is very specific, it explains how we ensure that quote chat projects are not incorrectly displayed amongst a seller’s real projects.

Quote chat – ubiquity!

Clients are able to submit quote requests. In response, SafeBill creates a project for the associated conversation. These are known as ‘quote chat’ projects. An example would be `Quote Chat: alice ↔ bob`. It made sense to create this type of project so that people could discuss a project before formally agreeing terms.

Unfortunately, we originally did not distinguish between quote chat and real projects. They both utilised the same model, status and API list. Thus, a seller’s dashboard included:

1. Real projects – those that they were actively working on.

2. Quote chat projects – for clients who had never even worked with the seller.

With constant quote requests, sellers struggled to effectively access their dashboards. Once again, this was because real and possibly unproductive quote chat projects were combined. Sellers identified this problem and so it was essential that we addressed it.

My initial attempt was unsuccessful

I aimed to add a new field to a serializer and subsequently hide quote chat projects from a seller’s dashboard. Again, I performed this filtering on the front-end using JavaScript.

Unfortunately, despite the frontend successfully concealing quote chat projects, other areas of the app – such as mobile dashboards, emails and a seller’s dashboard – still displayed them. Moreover, the project count was incorrect. For example, a seller might view 5 projects, but in fact, only 2 of these would be real.

Modifying data on the front-end is a temporary solution. To efficiently hide quote chat projects, filtering needs to occur at data source level.

Adding project_type

We added a new project_type field to the Django Project model. This can either be `real_project` or `quote_chat`. As the default value is `real_project`, there is no need to amend current projects.

`backend/safebill/projects/models.py`

```python

PROJECT_TYPE_CHOICES = [

("real_project", "Real Project"),

("quote_chat", "Quote Chat"),

]

project_type = models.CharField(

max_length=20,

choices=PROJECT_TYPE_CHOICES,

default="real_project",

help_text="Type of project - real project or quote chat",

)

```

We then created a migration to alter the database. Old projects were automatically designated as `real_project`. Newly created quote chat projects are specifically defined as `quote_chat`.

`backend/safebill/projects/migrations/0013_add_project_type.py`

```python

# Migration adds project_type to the Project table

# Existing projects are backfilled as 'real_project'

```

Migration 0013_add_project_type was non-intrusive and everything continued to work as normal.

Further data filtering

With project_type in place, we amended our list views so that only real projects are displayed by default.

`backend/safebill/projects/views.py`

```python

class ProjectListAPIView(generics.ListAPIView):

def get_queryset(self):

return Project.objects.filter(

user=self.request.user,

project_type="real_project"

).order_by("-id")

class ClientProjectListAPIView(generics.ListAPIView):

def get_queryset(self):

return Project.objects.filter(

client=self.request.user,

project_type="real_project"

).order_by("-id")

```

Now, only real projects are seen by both sellers and clients. Quote chat projects are no longer incorrectly presented.

We then also added the project_type field to our serializers so that it can be recognised on the front-end (where necessary).

`backend/safebill/projects/serializers.py`

ProjectListSerializer – for seller project lists.

ClientProjectSerializer – for client project lists.

Both of these now include the project_type field.

Displaying a quote chat list

Whilst sellers still wish to see their quote chat projects, they do not want to view them on their general project list. Thus, we created a new endpoint for this.

`backend/safebill/chat/views.py`

```python

class QuoteChatListAPIView(generics.ListAPIView):

permission_classes = [permissions.IsAuthenticated]

serializer_class = ProjectListSerializer

def get_queryset(self):

return Project.objects.filter(

user=self.request.user,

project_type="quote_chat"

).order_by("-id")

```

Moreover, new quote chat projects are appropriately designated from the outset.

`backend/safebill/chat/views.py`

```python

project = Project.objects.create(

user=seller,

client=buyer,

name=f"Quote Chat: {buyer.username} ↔ {seller.username}",

client_email=buyer.email or "",

project_type="quote_chat",

)

```

Despite the amendment, the chat functionality remained unaffected. As before, sellers can message, communicate and receive alerts. Only the list view had been modified.

Problem

During testing, one seller still saw a quote chat project incorrectly amongst their real projects post-migration. Investigation uncovered the reason. Although the migration had altered existing database entries, a test data seeding file had been used to manually insert an extra database entry. Significantly, this entry had not had a project_type value allocated to it and so was left as `NULL`.

Whilst the database does permit `NULL` values (due to the absence of `null=True, blank=True` being specified), as this was not indicated in the model, the model’s default value was used. However, raw SQL can supersede this. Initially, we ran the aforementioned migration. We then re-saved relevant projects so that the model’s default value would be implemented. Within a live setting, the migration alters all existing database entries. Currently, in test settings, projects are seeded using the model, rather than raw SQL.

Having done this, a seller will now have the correct number of real and quote chat projects displayed. If they have 3 real and 10 quote chat projects, their general dashboard will show 3 projects and their quote chat dashboard will demonstrate 10. Both figures are accurate.

What I would alter

Ideally, I would have added the project_type field earlier, so that it was available before a large number of quote chat projects had been seeded. Although the migration was easy to implement, it did take some time to shift my mental model.

I would also investigate whether it would be beneficial to automatically move quote chat projects to an archive once they had been inactive for a certain duration. Currently, these projects are not archived and are therefore always displayed. For a seller with a high volume of projects, this may lead to long quote chat lists. Again, although this is not currently problematic, it is an area for potential future consideration.

Where not suitable

If your app does in fact need to present and operate quote chat projects in exactly the same manner as real projects, then you should not separate them. Within SafeBill, we do differentiate between them as quote chat projects are temporary and transactional. However, for a chat-only app, adding a project_type field would unduly complicate the development process.

Important points

Although it may seem expedient to filter data on the front-end, this is not reliably effective for an app. Ideally, data filtering should be undertaken at source. Successfully distinguishing between quote chat and real projects was efficiently achieved by adding a field to a database table and then amending a queryset.

Additional information

Should you be developing a marketplace and also face challenges with over-whelming displays, please do leave a comment below. How does your app handle temporary chat projects and display them within project lists?

You may also be interested in reading how the SafeBill escrow system releases seller payments for project milestones once clients have approved relevant stages.

About me

I design and develop SafeBill (safebill.fr) for FalconXoft / Protonixs. My blog examines payment, escrow and marketplace subjects and draws from my development experience.

Published: 2026-11-26

Last updated: 2026-11-26