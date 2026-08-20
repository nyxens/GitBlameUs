# Product Specification: LifeVault BBMS

<!-- impeccable:product-schema 1 -->

## Platform

Web Application (Fullstack)

## Stack
- **Frontend**: React 18 + Javascript + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: MongoDB 6.0+ with Mongoose ODM (10-Collection ER Model)

## Users
- **System Administrators (`Admin`)**: Root administrators managing hospital facilities, regional blood banks, and staff credentials.
- **Enterprise Healthcare Staff (`Staff`)**: Doctors, phlebotomists, lab technicians, and managers collecting blood from donors and authorizing allotments.
- **Individual Users / Donors (`User`, `Donor`)**: Citizens donating blood, tracking physiological vitals, and receiving impact notifications.
- **Patients & Request Placed Parties (`User`, `Request`)**: Individuals or institutions placing blood requisitions.

## Product Purpose
LifeVault is an enterprise-grade blood bank management system (BBMS) designed to eliminate transfusion errors, prevent stock expiration with FEFO queueing, maintain physical cold-storage cell and shelf inventory, and ensure atomic allocation of blood units to patient requests.

## Data Architecture (10 ER Collections)
1. **`Admin`**: Platform administration and facility oversight.
2. **`Hospital`**: Healthcare institutions linked to internal cold inventory storage.
3. **`BloodBank`**: Regional blood processing and storage centers.
4. **`Staff`**: Medical staff with "is a" relation to `User` and work assignments to hospitals/blood banks.
5. **`User`**: Base profile for donors, recipients, and medical staff.
6. **`Donor`**: Donation events producing blood bags, collected by staff.
7. **`Inventory`**: Cold storage lockers with cell and shelf tracking.
8. **`BloodBag`**: Individual blood units with vitals (haemoglobin, pressure), expiry, and discard flags.
9. **`Request`**: Requisitions placed by users with required volume and deadline.
10. **`Allotment`**: Audited allocation linking a blood bag to a request with staff sign-off.

## Key Capabilities
- **ABO/Rh Compatibility Engine**: Automated donor-recipient matrix calculator.
- **FEFO Inventory Allocation**: Compound indexing `{ bloodgroup: 1, status: 1, isdiscresed: 1, expired_date: 1 }` prioritizing units nearest expiry.
- **Physical Cell & Shelf Tracking**: Locates blood bags in specific compartments (`cellno`, `shelfno`).
- **Concurrency & Double-Allocation Guard**: Unique database index on `Allotment.bag_id` preventing double-assignment of blood bags.

## Product Principles
1. **Clinical Precision**: Eliminate manual transfusion errors with automated ABO/Rh validation.
2. **Zero Expiry Waste**: Prioritize oldest viable stock using strict FEFO inventory queues.
3. **Emergency Velocity**: Streamline emergency requisitions for instant hospital dispatch.
4. **Auditable Traceability**: Every blood bag is traceable from donor to staff collector, storage shelf, and recipient allotment.
