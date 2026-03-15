/**
 * Attribute-Based Access Control (ABAC) Service
 *
 * Evaluates AccessPolicy records for a given context (user, connection, request).
 * Policies are scoped to a FOLDER, TEAM, or TENANT and can restrict sessions based on:
 *   - Time windows (e.g., "09:00-18:00" UTC)
 *   - Trusted device (user authenticated with WebAuthn in this login)
 *   - MFA step-up (user completed TOTP or WebAuthn challenge in this login)
 *
 * NOTE: SecretCheckoutRequest Segregation-of-Duties (SoD) enforcement — where
 * approverId !== requesterId — will be added here when PAM-111 (privileged access
 * management checkout flow) is implemented.
 */

import prisma from '../lib/prisma';
import * as auditService from './audit.service';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AbacContext {
  userId: string;
  /** Folder the connection belongs to, if any */
  folderId?: string | null;
  /** Team the connection belongs to, if any */
  teamId?: string | null;
  /** Tenant the user is currently operating in, if any */
  tenantId?: string | null;
  /** True if the user used a WebAuthn credential during the current login session */
  usedWebAuthnInLogin: boolean;
  /** True if the user completed any MFA challenge (TOTP or WebAuthn) during this login */
  completedMfaStepUp: boolean;
  /** Client IP address, used for audit logging */
  ipAddress?: string | null;
  /** Target connection ID, used for audit logging */
  connectionId?: string;
}

export interface AbacDenial {
  allowed: false;
  reason: AbacDenyReason;
  policyId: string;
  targetType: string;
  targetId: string;
}

export interface AbacAllowed {
  allowed: true;
}

export type AbacResult = AbacAllowed | AbacDenial;

export type AbacDenyReason =
  | 'outside_working_hours'
  | 'untrusted_device'
  | 'mfa_step_up_required';

// ---------------------------------------------------------------------------
// Time window helpers
// ---------------------------------------------------------------------------

/**
 * Parse a time string "HH:MM" into total minutes since midnight.
 */
function parseTimeMinutes(t: string): number {
  const [hh, mm] = t.split(':').map(Number);
  return (hh ?? 0) * 60 + (mm ?? 0);
}

/**
 * Returns true if the current UTC time falls within ANY of the provided
 * comma-separated time windows (format: "HH:MM-HH:MM").
 */
export function isWithinAllowedTimeWindows(allowedTimeWindows: string): boolean {
  const now = new Date();
  const currentMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();

  const windows = allowedTimeWindows.split(',').map((w) => w.trim());
  for (const window of windows) {
    const [startStr, endStr] = window.split('-');
    if (!startStr || !endStr) continue;

    const start = parseTimeMinutes(startStr.trim());
    const end = parseTimeMinutes(endStr.trim());

    if (start <= end) {
      // Normal window (e.g., "09:00-18:00")
      if (currentMinutes >= start && currentMinutes <= end) return true;
    } else {
      // Overnight window (e.g., "22:00-06:00")
      if (currentMinutes >= start || currentMinutes <= end) return true;
    }
  }

  return false;
}

// ---------------------------------------------------------------------------
// Core evaluation
// ---------------------------------------------------------------------------

/**
 * Evaluate all AccessPolicies that apply to the given context.
 * Policies are collected for the connection's folder, team, and tenant (most
 * specific first). The first denial encountered is returned immediately.
 *
 * Returns `{ allowed: true }` if all policies pass or none exist.
 * Returns `{ allowed: false, reason, policyId, ... }` on the first denial.
 *
 * The caller is responsible for sending the 403 response and logging the denial
 * via `logAbacDenial`.
 */
export async function evaluate(ctx: AbacContext): Promise<AbacResult> {
  // Collect candidate target scopes in order of specificity: FOLDER > TEAM > TENANT
  const targets: Array<{ targetType: 'FOLDER' | 'TEAM' | 'TENANT'; targetId: string }> = [];

  if (ctx.folderId) targets.push({ targetType: 'FOLDER', targetId: ctx.folderId });
  if (ctx.teamId) targets.push({ targetType: 'TEAM', targetId: ctx.teamId });
  if (ctx.tenantId) targets.push({ targetType: 'TENANT', targetId: ctx.tenantId });

  if (targets.length === 0) {
    // No scopes to check — allow by default
    return { allowed: true };
  }

  // Fetch all applicable policies in one query
  const policies = await prisma.accessPolicy.findMany({
    where: {
      OR: targets.map((t) => ({
        targetType: t.targetType,
        targetId: t.targetId,
      })),
    },
  });

  if (policies.length === 0) {
    return { allowed: true };
  }

  // Sort by specificity: FOLDER first, then TEAM, then TENANT
  const order: Record<string, number> = { FOLDER: 0, TEAM: 1, TENANT: 2 };
  policies.sort((a, b) => (order[a.targetType] ?? 3) - (order[b.targetType] ?? 3));

  for (const policy of policies) {
    // --- Time window check ---
    if (policy.allowedTimeWindows) {
      if (!isWithinAllowedTimeWindows(policy.allowedTimeWindows)) {
        return {
          allowed: false,
          reason: 'outside_working_hours',
          policyId: policy.id,
          targetType: policy.targetType,
          targetId: policy.targetId,
        };
      }
    }

    // --- Trusted device check ---
    if (policy.requireTrustedDevice && !ctx.usedWebAuthnInLogin) {
      return {
        allowed: false,
        reason: 'untrusted_device',
        policyId: policy.id,
        targetType: policy.targetType,
        targetId: policy.targetId,
      };
    }

    // --- MFA step-up check ---
    if (policy.requireMfaStepUp && !ctx.completedMfaStepUp) {
      return {
        allowed: false,
        reason: 'mfa_step_up_required',
        policyId: policy.id,
        targetType: policy.targetType,
        targetId: policy.targetId,
      };
    }
  }

  return { allowed: true };
}

// ---------------------------------------------------------------------------
// Audit helper
// ---------------------------------------------------------------------------

/**
 * Log an ABAC denial to the audit log. Fire-and-forget — never throws.
 */
export function logAbacDenial(ctx: AbacContext, denial: AbacDenial): void {
  auditService.log({
    userId: ctx.userId,
    action: 'SESSION_DENIED_ABAC',
    targetType: 'Connection',
    targetId: ctx.connectionId,
    details: {
      reason: denial.reason,
      policyId: denial.policyId,
      policyTargetType: denial.targetType,
      policyTargetId: denial.targetId,
    },
    ipAddress: ctx.ipAddress ?? undefined,
  });
}
