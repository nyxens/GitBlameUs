/**
 * Unified Requisition System:
 * SeekerRequest is an alias / re-export of the unified Request model, ensuring
 * that hospital orders and citizen requests share the exact same MongoDB collection,
 * schema, lifecycle states, and allotment procedures.
 */
import Request, {
  RequestSchema,
  BLOOD_GROUPS,
  TARGET_INSTITUTION_TYPES,
  REQUEST_STATUSES,
} from './Request.js';

export const SEEKER_REQUEST_STATUSES = REQUEST_STATUSES;
export { BLOOD_GROUPS, TARGET_INSTITUTION_TYPES };

export const seekerRequestSchema = RequestSchema;
export const SeekerRequestSchema = RequestSchema;
export const SeekerRequest = Request;

export default Request;
