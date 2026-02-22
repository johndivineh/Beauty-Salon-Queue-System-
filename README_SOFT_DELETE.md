# Soft Delete & Audit System Documentation

## Overview
The Northern Bar queue system has been upgraded to include a robust "Soft Delete" and "Audit Trail" mechanism. This ensures that no customer data is permanently removed from the system, providing a full historical record for analytics and dispute resolution.

## Key Features

### 1. Soft Delete Workflow
- **No Permanent Deletions**: The `delete` operation has been replaced by a soft delete. Tickets are marked with a status of `DELETED`, `CANCELLED`, or `NO_SHOW` instead of being removed from the state.
- **Mandatory Reason Capture**: Whenever a staff member removes a ticket (Delete, Cancel, No-Show), a modal appears requiring a reason for the action. The action cannot proceed without a reason.
- **Metadata Storage**: Every removed ticket stores:
    - `deletedAt`: Timestamp of removal.
    - `deletedBy`: The administrator who performed the action.
    - `deleteReason`: The mandatory reason provided.
    - `deletedFromStatus`: The status of the ticket before it was removed.
    - `deleteActionType`: Categorization of the removal (e.g., `CANCELLED`, `NO_SHOW`, `VOIDED`).

### 2. Audit Trail
- **Immutable Logs**: Every destructive or significant action (Status changes, Deletions, Queue Resets) is recorded in an immutable `auditLogs` collection.
- **Details Captured**: Each log entry includes the timestamp, actor, action type, ticket ID (if applicable), and a JSON blob of the relevant details.

### 3. Session History Page
- A new "Session History" tab in the Admin Dashboard allows administrators to view all historical tickets, including those that were soft-deleted.
- **Filtering**: Records can be filtered by Branch and Date.

### 4. Reset Queue Feature
- Located in the "Queue Ops" tab.
- Allows clearing all active tickets for a branch at once (e.g., at the end of the day).
- Requires a mandatory reason.
- All tickets are soft-cancelled, and a single audit log entry is created for the reset action.

## Technical Implementation

### Data Model Updates (`types.ts`)
- Added `DELETED`, `CANCELLED`, `NO_SHOW` to `QueueStatus`.
- Added `DeleteActionType` enum.
- Added audit-related fields to `QueueEntry`.
- Added `AuditAction` enum and `AuditLogEntry` interface.

### State Management (`store.tsx`)
- `softDeleteTicket(id, reason, actionType, actor)`: Handles the logic of updating a ticket and logging the audit.
- `resetQueue(branch, reason, actor)`: Handles bulk cancellation and logging.
- `updateQueueStatus`: Now accepts an `actor` and logs an audit entry for every status change.

### UI Components (`AdminDashboard.tsx`)
- `DeleteReasonModal`: Reusable modal for capturing removal reasons.
- `ResetQueueModal`: Modal for queue reset confirmation.
- `Session History` & `Audit Logs` tabs for data visualization.

## Customer Experience
- If a customer attempts to track a ticket that has been soft-deleted or cancelled, they will see a "Ticket Cancelled" page explaining the reason, rather than a generic "Not Found" error.
