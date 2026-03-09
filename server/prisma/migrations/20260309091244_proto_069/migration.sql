-- AlterEnum
ALTER TYPE "ConnectionType" ADD VALUE 'VNC';

-- AlterEnum
ALTER TYPE "SessionProtocol" ADD VALUE 'VNC';

-- AlterTable
ALTER TABLE "Connection" ADD COLUMN     "vncSettings" JSONB;
