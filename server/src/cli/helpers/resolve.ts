import prisma from '../../lib/prisma';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function resolveUser(identifier: string) {
  if (UUID_RE.test(identifier)) {
    return prisma.user.findUnique({ where: { id: identifier } });
  }
  return prisma.user.findUnique({ where: { email: identifier } });
}

export async function resolveTenant(identifier: string) {
  if (UUID_RE.test(identifier)) {
    return prisma.tenant.findUnique({ where: { id: identifier } });
  }
  return prisma.tenant.findFirst({ where: { slug: identifier } });
}
