# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Healthcare & Blood Bank Staff (`Staff`)**: Lab technicians, phlebotomists, and facility operators managing blood donation intake, blood bag testing, cold storage shelf placement, and emergency requisition allotments.
- **Citizens & Donors (`Citizen` / `Donor`)**: Everyday citizens scheduling donations, verifying eligibility, tracking their blood vitals and donation history, or locating urgent blood units for family emergencies.
- **Hospital Administrators & Systems (`Admin` / `Hospital`)**: Medical facility administrators managing hospital requisitions, tracking cross-facility inventory, and managing staff credentials.

## Product Purpose

LifeVault BBMS is a full-stack Blood Bank Management and Telemetry System designed to eliminate transfusion mismatches, prevent blood inventory expiry, and connect citizens, hospitals, and blood banks seamlessly through an intuitive, aesthetic, and reliable web interface.

## Positioning

An ultra-clean, aesthetic, and accessible unified interface bridging mission-critical clinical operations (physical cold-storage cell/shelf tracking, automated ABO/Rh validation, and strict First-Expired, First-Out FEFO queues) with frictionless citizen and hospital engagement.

## Operating Context

- High-stress clinical environments requiring instant scanability, rapid data entry, zero hesitation, and immediate clarity during emergency blood requests.
- Citizen mobile and desktop web browsers where ease of navigation, reassuring trust signals, and clear health status indicators encourage recurring donations.
- Facility cold rooms and inventory workstations managing physical storage compartments (`cellno`, `shelfno`).

## Capabilities and Constraints

- **ABO/Rh Compatibility Engine**: Automated donor-to-recipient cross-matching matrix calculator.
- **FEFO Inventory Queuing**: Priority dispatch algorithms ordering stock by expiration date to guarantee zero spoilage.
- **Cell & Shelf Telemetry**: Granular physical location indexing for every individual blood bag in refrigeration units.
- **Concurrency & Double-Allocation Guard**: Atomic database indexing preventing concurrent allotment or duplicate assignment of blood units.
- **Role-Gated Workspaces**: Dedicated portals for citizens, hospital staff, and facility administrators with cookie-based session management.

## Brand Commitments

- **Name**: LifeVault BBMS (GitBlameUs)
- **Design Philosophy**: Aesthetic, modern, high-clarity interface with clean visual hierarchy that de-stresses clinical workflows and welcomes donors.
- **Tone**: Reassuring, technologically precise, transparent, and humane.

## Product Principles

1. **Aesthetic & Frictionless Usability**: Eliminate clutter; make vital operational tasks intuitive and de-stressed for both hospital operators and everyday citizens.
2. **Clinical Precision & Safety**: Prevent human errors through automated ABO/Rh matrix validation and atomic allocation locks.
3. **Zero-Waste FEFO Dispatch**: Prioritize oldest viable stock systematically to eliminate preventable blood product expiration.
4. **End-to-End Traceability**: Maintain verifiable provenance for every blood bag from donor vitals to shelf compartment and hospital allotment.

## Accessibility & Inclusion

- High contrast text and distinguishable status indicators (safe, urgent, critical expiry) conforming to WCAG AA.
- Clear visual hierarchy with responsive accessibility across standard clinical workstation displays and mobile citizen devices.
