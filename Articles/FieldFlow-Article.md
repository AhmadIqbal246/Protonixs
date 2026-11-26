Rebuilt roofing CRM Kanban, tenant workflows and updating jobs

Meta description: Information on my experience of converting a non-tenant roofing Kanban to tenant workflows, statuses and boards. Details of how to update jobs is also provided. Coding and learning points included.
URL slug: `rebuilt-roofing-crm-kanban-tenant-workflows`
Keywords: roofing CRM board workflow
Secondary Keywords: multi-tenant SaaS; Django REST Framework; Next.js Kanban; tenant workflow; analogous to JobNimbus status; construction CRM pipeline; workflow update.
Introduction
Previously my roofing Kanban used the same 7 columns for retail and insurance. Despite insurance having unique pipeline stages, these were never shown on my Kanban. Instead, they were stored in a job’s file as tick boxes. For example, a job may be in the ‘Estimate’ column but still have an outstanding adjustor meeting 3 days previously. Unfortunately nobody recognised this.
I tried to address this by adding a filter to my Kanban to show jobs in accordance with their workflow type. But my board had no awareness of workflows. There were 3 incorrect pipeline types:
1. An enum field `JobWorkflowType` on an opportunity. Values could only be either retail_cash or insurance_restoration. This was merely a title and provided no further data. Again, the board never utilised this.
2. Pipeline templates in `workflow_template_service.py`. Arrays of pipeline stages were hardcoded and then copied into `JobWorkflowProgress`. Again, these were in the form of tick boxes.
3. `ROOFING_WORKFLOW_PIPELINE_NAMES` in `pipeline_service/constants.py`. This was a global array of pipeline titles – Lead, Inspection, Estimate, Contract, Scheduling, Production and Complete. It was initialised for all tenants.
All were hardcoded. Updates such as adding a ‘Commercial’ workflow would consequently involve editing Python code and re-deploying my application. I wanted to avoid this.
Summary
I added 4 new models – Workflow, WorkflowStatus, Board and BoardColumn. Now, tenants can control their workflows and statuses. Each status links to one of 8 fixed reporting stages. Boards are essentially board views. More than one status can be within a BoardColumn. Single status BoardColumns allow a job to be placed there. Multiple status BoardColumns open up a sub-menu, from which a status can be chosen. As with JobNimbus, a tenant can thus merge two workflow statuses onto one board. Jobs are not duplicated.
FieldFlow
This is my primary project. It is a multi-tenant application that provides roofing and construction contractors with tools to manage their CRM, quotation, finance, scheduling, production and SOWs. It also connects to QuickBooks, HubSpot, EagleView and ABC Supply. Backend technologies include; Django 5.2 and Django REST Framework, PostgreSQL 15, Redis 7 and Celery 5.4 – all running on Python 3.11. Front-end tools are; Next.js 16 (including App Router), React 19, Redux Toolkit, TanStack Query and Tailwind CSS v4. JavaScript (but not TypeScript) is used. Data is tenant scoped. Access permissions depend on a person’s role and can even be role specific for views.
Although this blog-post relates specifically to one FieldFlow board (roofing), the following is background information.
Requirements
Python 3.11, Django 5.2 and DRF 3.15.
PostgreSQL 15 and Redis 7.
Node 20+, Next.js 16, React 19.
A roofing tenant to activate the seed service.
Previous set up
Each opportunity had a `job_workflow_type`, and belonged to a shared Pipeline and Stage. Although my roofing Kanban could view pipeline titles, workflow type was not referenced. Consequently, insurance and retail opportunities were both presented in identical columns. Moreover, insurance specific pipeline stages were never shown.
Whilst I did not want to amend the construction pipelines (as these hold good data including gate-keeping, exit conditions and SOW requirements), the Sales, Intake, Production and Closeout pipeline stages are still applicable there. For roofing, I simply ensured my board did not reference these stages once the new data structure was in place.
New models
Below are the key new models.
`crm/models/workflow.py`
```python
class ReportingStage(models.TextChoices):
LEAD = 'lead', 'Lead'
ESTIMATING = 'estimating', 'Estimating'
SOLD = 'sold', 'Sold'
IN_PRODUCTION = 'in_production', 'In Production'
ACCOUNTS_RECEIVABLE = 'accounts_receivable', 'Accounts Receivable'
COMPLETED = 'completed', 'Completed'
LOST = 'lost', 'Lost'
NONE = 'none', 'None'
class Workflow(TenantScopedModel):
tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE)
name = models.CharField(max_length=128)
record_kind = models.CharField(max_length=32, default='job')
system_key = models.CharField(max_length=64, null=True, blank=True)
color = models.CharField(max_length=32, default='#3B82F6', blank=True)
display_order = models.PositiveIntegerField(default=0)
cloned_from = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)
class WorkflowStatus(TenantScopedModel):
tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE)
workflow = models.ForeignKey(Workflow, on_delete=models.CASCADE, related_name='statuses')
name = models.CharField(max_length=128)
display_order = models.PositiveIntegerField(default=0)
reporting_stage = models.CharField(max_length=100, default='Lead')
archive_on_enter = models.BooleanField(default=False)
is_lost = models.BooleanField(default=False)
```
`crm/models/board.py`
```python
class Board(TenantScopedModel):
tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE)
name = models.CharField(max_length=128)
record_kind = models.CharField(max_length=32, default='job')
color = models.CharField(max_length=32, default='#3B82F6', blank=True)
source_workflow = models.ForeignKey(Workflow, on_delete=models.SET_NULL, null=True, blank=True)
class BoardColumn(TenantScopedModel):
board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name='columns')
name = models.CharField(max_length=128)
display_order = models.PositiveIntegerField(default=0)
statuses = models.ManyToManyField(WorkflowStatus, blank=True)
```
Some design decisions:
Statuses now own tick boxes. The `WorkflowStatusRequirement` links to a status. It includes a key and title and indicates if a requirement is compulsory. Previously, this information was stored in job files. New statuses now have their own tick boxes.
As board views, boards can have a `source_workflow`, which identifies which workflow the board was seeded from. Crucially, boards do not own opportunities. Consequently, removing a board has no impact on jobs or statuses. This was a strict requirement as people frequently delete views and should not therefore lose data.
BoardColumns can hold one or more statuses. With just one status, a job can be moved there. With several, a sub-menu facilitates status selection. As with JobNimbus, tenants can therefore add statuses from 2 workflows to one board. Jobs are not duplicated.
Eight reporting stages
In contrast to pipelines, reporting stages are not tenant definable. Each status links to one of 8 fixed reporting stages – Lead, Estimating, Sold, In Production, Accounts Receivable, Completed, Lost and None. Lost can be chosen from any status. None is also un-assigned and is not reported on.
Because reporting stage names are fixed, reports can be produced accurately. Nevertheless, tenants can set which status maps to which reporting stage and in what sequence. If someone attempts to save a workflow with a reverse order to Lead, Estimating, Sold, In Production, Accounts Receivable, Completed, this will not be allowed. Lost and None are unaffected. To prevent incorrect status sequences being saved, I also added validation to both the workflow move and PATCH status services. This avoids jobs being impacted by erroneous sequencing.
Roofing tenant seed
Upon starting up, a roofing tenant is seeded with 2 workflows and 2 boards. Each has 13 statuses which are related to the 8 reporting stages in the following way:
1. Lead (Lead)
2. Appointment Schedule (Lead)
3. Estimating (Estimating)
4. Pending Signature (Estimating)
5. Signed Contract (Sold)
6. Pre-Production (In Production)
7. Ready and Waiting (In Production)
8. Work In Progress (In Production)
9. Final Walk Through (In Production)
10. Work Completed (In Production)
11. Pending Payments (Accounts Receivable)
12. Paid and Closed (Completed)
13. Lost (Lost)
Initially, the retail and insurance workflows are identical. Within a job file, however, the `system_key` dictates if insurance panels are shown. Clone workflows have a null system key so that a tenant’s ‘Insurance copy’ does not accidentally include insurance panels. Significantly, I do not assume that a workflow is insurance based simply from its title.
Seed processes are idempotent. They will not create duplicate statuses. Rather, they will archive old statuses which are no longer defined and re-introduce those which are. As I frequently had to seed during development, this was especially pertinent.
Scary data update
I was most anxious about this element. Existing roofing opportunities had both a `job_workflow_type` and `JobWorkflowProgress`. I needed to allocate a workflow and status to each opportunity without moving jobs.
The `backfill_existing_records` function:
Firstly, where a lead does not have a workflow, one is allocated depending on the `job_workflow_type`. Insurance leads receive the insurance workflow. All other leads are given the retail workflow.
Secondly, for every opportunity, a workflow is allocated in accordance with its `job_workflow_type`. Should no or unknown workflow type exist, then the retail workflow is defaulted to.
Lastly, a status is allocated in line with an opportunity’s existing progress. Where no progress data is present, an alias map is used to convert previous milestone titles to new status names. For example, ‘Supplement Submitted’ equates to ‘Work In Progress’ and ‘Certificate of Completion Submitted’ becomes ‘Pending Payments’. Should there be no matching title, the job is given the first status in its workflow – Lead. Although not perfect, this is preferable to causing an error. Also, a job’s history is still recorded in the activity feed.
Initially I incorrectly tried to directly associate a previous milestone title with a status. However, as titles have changed over time, this method did not work for approximately one third of jobs. The alias map rectified this. Even though this is both long and aesthetically un-pleasing, I am not fussed as it only needed to be implemented once and worked effectively.
Following updating, a nullable foreign key `workflow_status` is added to the `JobWorkflowProgress` model, relating to the new status. Historic `JobWorkflowProgress` entries are also retained. Fortunately, in-process jobs are not impacted.
Moving jobs
When a job is dragged,
```http
POST /crm/opportunities/{id}/move-status/
Content-Type: application/json
{ "status_id": "" }
```
This is handled by `WorkflowMoveService.move_opportunity_status` which:
```python
if opportunity.workflow_id and target_status.workflow_id != opportunity.workflow_id:
raise ValidationError('Cannot move opportunity to a status from a different workflow.')
if not opportunity.workflow_id:
opportunity.workflow = target_status.workflow
previous_status = opportunity.status
opportunity.status = target_status
if target_status.archive_on_enter:
opportunity.is_active = False
# stage dates, activity feed, save
```
This ensures that jobs cannot be moved between workflows. For instance, if a retail job was dragged onto an insurance column, a 400 error is issued. The frontend then re-locates the job and displays the error.
The function also handles reporting stage dates. Entering a new stage sets its date to today. Where previous stages do not have dates, these are automatically back-filled. Transitioning to Lost only affects that stage. Leaving Lost resets all stage dates. The target stage is then regarded as a new entry. None has no impact. Date handling is analogous to that in JobNimbus Insights. Consequently, a job’s ‘Sold date’ now relates to the first time it entered any Sold status – it is no longer manually input.
Front-end
The roofing Kanban no longer references the general life-cycle Kanban. Rather, it shows a workflow board. Relevant code is:
```javascript
export function useWorkflowBoardCards(boardId, queryParams = {}) {
const { salesRep, assignee, jobType, q } = queryParams;
return useQuery({
queryKey: ['workflow-board-cards', boardId, salesRep, assignee, jobType, q],
queryFn: async () => {
if (!boardId) return null;
const params = new URLSearchParams();
if (salesRep) params.append('sales_rep', salesRep);
if (assignee) params.append('assignee', assignee);
if (jobType) params.append('job_type', jobType);
if (q) params.append('q', q);
const url = `${API_ENDPOINTS.CRM_BOARD_CARDS(boardId)}?${params.toString()}`;
const response = await apiClient.get(url);
return response.data;
},
enabled: !!boardId && !!store.getState().auth.accessToken,
staleTime: 30 * 1000,
});
}
```
Jobs can be:
- Moved to a single status column.
- Placed on a multi-status column after first selecting a status from a sub-menu.
- If the API rejects a move, a toast notification is shown and the job is relocated.
- On mobile devices, columns are handled sequentially, in-line with current mobile Kanban behaviour.
A board menu in the header lets users switch between Retail, Insurance and custom boards. Cards are also presented in table format in list-view. They are grouped by status, in the order of board column titles.
Real bug
Originally my PATCH status service allowed tenants to re-arrange statuses so that a Sold status came before an Estimating status. Even though my board was correctly ordered, reports were not. Jobs which had not yet been estimated were wrongly showing a ‘Sold date’ as the back-fill process for stage dates presumed that there would be logical sequencing.
I introduced `validate_workflow_status_order`. This is utilised by both the move and PATCH services. It returns a 400 error indicating which status is invalid. The frontend displays this close to the erroneous status row. Fortunately, although it took me until the afternoon to trace the issue, I was able to swiftly (within 10 minutes) resolve it. Generally, this is my experience.
Settings
Workflow and board settings can be accessed via `dashboard/settings/workflows` and `dashboard/settings/boards`.
Within workflow settings, statuses are listed and can be re-ordered by dragging. For each status, details such as title, reporting stage and a checkbox to enable archiving on entry can be altered. Furthermore, status requirements can be updated. Clicking on ‘Load Retail and Insurance’ dispatches a `POST /crm/workflows/seed-defaults/` request. It is then hidden, having created both system workflows.
Workflow boards can be imported. For each active status, a column is created. Columns can then be renamed and ordered. A multi-select menu can also be used to determine which statuses are displayed on each column in ‘Workflow - Status’ format. Users must confirm deletion of a board. Jobs are unaffected by this.
Construction tenants continue to be able to access the old pipeline settings page. Roofs tenants see a short note and a link to Workflows. I have decided not to remove this as construction tenants still need access.
Out of scope
Whilst I endeavour to be truthful, below are aspects which were outside the scope of this project.
- Contact and work order workflows. Although my model does include a `record_kind`, functionality in this area has not yet been developed.
- Status automation. The QuickBooks ‘send when status entered’ facility remains on this list.
- Re-designing construction Sales, Intake, Production and Closeout. These continue to use pipelines and stages.
- Tenant reporting stage names. Reporting stages must remain fixed to ensure accurate reporting.
Integration pitfall
Whilst working on the roofing board, I also experimented with integrating with EagleView for aerial measurements. Orders were successfully authenticated and priced in the EagleView sandbox. However, the sandbox never produced a completed report. Calls to `GET /v3/Report/GetReport` yielded either a 204 or 400 response as no photogrammetry pipeline is available within the sandbox. After 2 hours of polling, I eventually located in the EagleView sandbox documentation that status updates must be posted to a callback URL rather than being polled for. In production, EagleView uses its CAD pipeline to analyse actual images and then produces a report. I now manage locally the ‘Processing Aerial Imagery’ stage for 204 responses and proceed from there. Again, this is a separate feature from the board. Nonetheless, it is the type of task that can easily consume an afternoon, especially if one trusts the sandbox sandbox.
Who should not use this
If your board is simple and your statuses are fixed then the generic pipeline model is less complex. Converting to allow tenant workflows is beneficial if tenants wish to tailor their statuses or if differing industries require different board columns. If you are not multi-tenant then you are essentially paying for superfluous functionality.
What I would do differently
I would produce an alias map before engaging with a database. I would also implement a ‘dry run’ mode for my back-fill function, allowing me to see what changes would be made. Neither of these steps were undertaken and so I manually compared before and after images. I have since learnt from this.
Subsequently, the dashboard sales widgets need amendment to reference `OpportunityStageDate` rather than milestone pipelines. Until this is done, they continue to access the old progress data. Therefore, the dashboard does not become empty during data updating. Post-amendment, the milestone stepper on a job’s file accesses statuses, again categorised by reporting stage. It no longer references the 7 common pipelines.
I am still unsure whether or not I should allow tenants to permanently delete statuses which are not currently attached to any job. For now I am opting for a soft-archival solution as hard deletion can complicate audit trails. I may yet change my decision.
About
Name: [Your Name]
Occupation: Developer
Company: FieldFlow
Bio: Builds multi-tenant roofing and construction software and writes about challenging and successful aspects of this.