# LifeVault Blood Bank Management System (BBMS)
## Project Status, Logical Problems & Completion Guide
*A plain-English guide to what works, what is broken, and how to finish the system.*

---

## 1. The Big Picture: What Are We Building?

Think of **LifeVault BBMS** as having two distinct sides that connect through a single database:

1. **The Hospital & Blood Bank Staff Side (The "Back Office")**:
   - Medical staff, lab technicians, and administrators who manage the actual blood.
   - They need to see **Inventory** (which blood bags are inside which freezer shelf/cell), **Donors** (who gave blood, their health stats, eligibility, and donation history), **Recipients** (patients and hospitals urgently asking for blood), and **History** (a secure log of every bag that enters or leaves the vault).

2. **The Citizen Side (The "Front Office")**:
   - Everyday citizens who visit the website.
   - They fall into two categories:
     - **Givers (Donors)**: People who want to donate blood. They fill out a form choosing a nearby blood bank and date, and then track their appointment status.
     - **Seekers (Patients/Families)**: People in need of blood for surgery or emergencies. They request units of a specific blood type and track their order.
   - **Important Rule**: Citizens should **never** see the internal inventory, other people's medical records, or facility audit logs. They only see their own requests and profile.

3. **The Partner Hospital Side**:
   - Emergency rooms and surgery centers that need to place bulk or emergency orders and track couriers.

---

## 2. Who Should See What? (The Access Rules)

Right now, the system does not separate these roles properly. Here is the exact plan for who should have access to what:

| User Role | What They Are | What Tabs They MUST See | What Tabs They MUST NOT See |
| :--- | :--- | :--- | :--- |
| **Admin** | System manager | **Inventory, Donors, Recipients, History, Profile** | Citizen donation forms (`Giver`, `Seeker`) |
| **Medical Staff** *(Doctor, Lab Tech, Phlebotomist, Manager)* | Hospital & Blood Bank operators | **Inventory, Donors, Recipients, History, Profile** | Citizen donation forms (`Giver`, `Seeker`) |
| **Citizen** *(Donor / Patient / Seeker)* | General public | **Giver** *(Donate Blood)*, **Seeker** *(Request Blood)*, **Profile** | **Inventory**, **Donors database**, **Recipients queue**, **History logs** |
| **Hospital Partner** | Hospital ER / Trauma Center | **Emergency Requisitions, Reserve Stock, Dispatches, Profile** | Citizen self-service forms, other hospitals' internal shelves |

---

## 3. What Is Working Right Now?

We recently resolved the initial startup and data pipeline issues:
- **MongoDB Atlas is connected and healthy**: The database timeout was extended from 2s to 15s so the cloud connection never drops on startup.
- **Admin & User login is working**: Authentication returns valid tokens and role permissions without crashing.
- **Real data fills the tables**:
  - The **Inventory** table displays real blood bags with barcodes, blood groups, storage lockers, and expiration dates.
  - The **Donors** table lists real donors with their donation counts, cities, and cooldown eligibility.
  - The **Giver incoming requests** table loads actual citizen donation applications.
  - The **Recipients** table displays active transfusion requisitions.
  - The **History** audit ledger shows actual blood bag intakes and allocations.

---

## 4. The 6 Main Logical Problems (In Plain English)

Here are the logical flaws in the current codebase that need fixing:

### Problem 1: Everyone Sees Everything (No Tab Privacy)
* **The issue**: When a regular citizen logs into the website, the top navigation bar shows all 7 tabs (`Inventory`, `Donors`, `Recipients`, `History`, `Giver`, `Seeker`, `Profile`). Even worse, it defaults to opening the **Inventory** tab!
* **Why this is bad**: A regular citizen should never see the internal blood vault, cold-chain freezer temperatures, or other citizens' names, blood types, and donation logs.
* **The solution**: Check the logged-in user's role. If they are a citizen, show only **Giver**, **Seeker**, and **Profile**. If they are staff/admin, show **Inventory**, **Donors**, **Recipients**, **History**, and **Profile**.

---

### Problem 2: Two Different Blood Request Systems That Don't Talk to Each Other
* **The issue**: There are currently two separate request models in the backend:
  1. `Request`: Used by hospital emergency orders and the old database seed.
  2. `SeekerRequest`: Used by the new citizen Seeker form.
* **Why this is bad**: When someone requests blood via the Seeker form and a doctor approves it, the system tries to link it to the old `Request` model. Because the models don't match, saving the allocation fails silently, and the History ledger prints *"Requisition record not found"*.
* **The solution**: Merge them into a single, clean requisition system so hospital orders and citizen requests use the exact same process.

---

### Problem 3: The "Infinite Stock" Bug (Inventory goes up, but never goes down)
* **The issue**:
  - When a donor gives blood, the system adds **+1** to the blood bank locker (`current_count`).
  - But when that blood is delivered to a patient, the system **never subtracts 1**!
  - In addition, the code accidentally sets the blood bag status to `"ALLOTED"` instead of the official database keyword `"ALLOCATED"`, and only marks 1 bag even if the patient requested 3 bags.
* **Why this is bad**: Over time, the system thinks the storage shelves are 100% full even if all the blood was given away to patients.
* **The solution**: When an order is fulfilled, subtract the units from the inventory count and update all chosen blood bags to `ALLOCATED` or `TRANSFUSED`.

---

### Problem 4: The Safe Matching Brain is Disconnected
* **The issue**: The codebase already has two smart helper files:
  1. `compatibilityEngine.js`: Knows that `O-` can be given to anyone, `A+` can only receive from `O-`, `O+`, `A-`, `A+`, etc.
  2. `fefoQueueService.js`: Implements **First-Expired-First-Out (FEFO)** so the oldest safe blood is used first before it expires.
  *However, neither file is actually being called anywhere in the backend!* In addition, the FEFO script looks for a field called `expirationDate`, but the database calls it `expired_date`, meaning it would calculate `NaN` (not a number) if turned on.
* **Why this is bad**: Staff currently have to manually guess which blood bag to pick instead of the system automatically proposing the safest, oldest compatible bag.
* **The solution**: Fix the field name to `expired_date` and plug the compatibility engine into the Recipient matching screen.

---

### Problem 5: The Recipients Screen Has No "Assign Blood" Button
* **The issue**: On the **Donors** page, staff have nice buttons to **Accept** or **Deny** incoming donations. But on the **Recipients** page, staff can only view rows—they cannot click a button to match and assign a specific blood bag from the freezer.
* **The solution**: Add an **"Allocate Blood"** button on each recipient row. Clicking it opens a popup showing candidate bags matching the patient's blood type (sorted by earliest expiration), letting staff confirm and dispatch the unit.

---

### Problem 6: Every Blood Bank Sees Every Other Blood Bank's Shelves
* **The issue**: Right now, when staff members log in, the Inventory screen shows all blood bags across the entire country. A technician at *Metro Hospital in New York* can see bags stored in *Central Red Cross in Brooklyn*.
* **The solution**: Filter the inventory and history by the specific hospital or blood bank the logged-in staff member belongs to, with an optional dropdown for Super Admins to view all branches.

---

## 5. How the Workflows Should Work in Real Life

### Workflow A: Donating Blood (Giver & Donor Flow)
1. **Citizen applies**: John opens the **Giver** tab, picks a nearby blood bank and a preferred date (Status: `Awaiting Verification`).
2. **Admin verifies**: Staff opens the **Donors** tab, reviews John’s profile, and clicks **Verify** (Status: `Verified`).
3. **Staff schedules**: Staff clicks **Accept** and assigns an appointment slot. The system automatically creates an `UNFULFILLED` placeholder unit in the inventory.
4. **Intake at blood bank**: John arrives and donates. Staff measures hemoglobin (e.g. 14.2 g/dL), blood pressure (120/80), confirms volume (450 ml), and assigns the bag to **Cell 01, Shelf 02**.
5. **Vault updated**: Staff clicks **Fulfill** in the Inventory. The blood bag is now marked `AVAILABLE` (with a 42-day lifespan), locker inventory increases by 1, and John's request is marked `COMPLETED`.

---

### Workflow B: Getting Blood (Seeker & Recipient Flow)
1. **Request placed**: An ER patient or citizen opens the **Seeker** tab and requests 2 units of `O-` blood (Status: `Pending Review`).
2. **Medical review**: Staff opens the **Recipients** tab, verifies the doctor's prescription, and clicks **Match Blood**.
3. **Smart matching**: The system checks ABO compatibility and finds the oldest viable `O-` bags in the vault.
4. **Allocation**: Staff clicks **Allocate Bags**. The system reserves the chosen bags (Status: `ALLOCATED`), decrements the storage locker count by 2, and logs an allotment record in History.
5. **Dispatch**: When couriered to the hospital, the order is marked `COMPLETED`.

---

## 6. Practical Step-by-Step Checklist to Finish the Project

Here is the straightforward plan to take this project across the finish line:

### Step 1: Fix Navigation & Role Gating (Completed ✓)
- [x] In `BBMSHeader.jsx`: Check `user.role`. If the user is a citizen, only show **Seeker**, **Giver**, and **Profile**.
- [x] If the user is an Admin or Staff, show **Inventory**, **Donors**, **Recipients**, **History**, and **Profile**.
- [x] In `BBMSWorkspace.jsx`: Default active section and guard rendering strictly based on user role (Citizens default to `seeker`, staff to `inventory`). Citizen accounts cannot access inventory or history.

### Step 2: Fix the Inventory Counter & Status Names (Completed ✓)
- [x] In `backend/services/seekerService.js`: Changed `'ALLOTED'` to the correct enum `'ALLOCATED'`.
- [x] Decremented `Inventory.current_count` when blood units are allocated to a recipient.
- [x] Set `BloodBag.status = 'ALLOCATED'` and `isdiscresed = true`.

### Step 3: Unify the Request Models (Completed ✓)
- [x] Merged `Request` and `SeekerRequest` into a single clean unified requisition system.
- [x] Created `Allotment.js` linkages referencing the unified `Request` model.
- [x] Hospital orders and citizen requests now share the exact same queue and process.

### Step 4: Cleanup Unused Algorithms (Completed ✓)
- [x] Deleted unused `backend/services/compatibilityEngine.js`.
- [x] Deleted unused `backend/services/fefoQueueService.js`.

### Step 5: Add the "Allocate Blood" Button & Mirror Donor Page (Completed ✓)
- [x] Mirrored `DonorsPage.jsx` architecture and UI to `RecipientsPage.jsx` with 4 interactive metric cards.
- [x] Added **"Allocate Blood"** modal that fetches candidate blood bags from cryogenic vault inventory.
- [x] Added **"Accept"** and **"Deny"** workflow controls for staff on every requisition row.

### Step 6: Add Blood Bank Location Filtering (Completed ✓)
- [x] Added facility selector dropdown to the Inventory page so staff can isolate their own institution's lockers.
- [x] Populated `hos_or_bank_id` on each inventory bag, displaying facility name and storage locker cells.
