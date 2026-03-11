import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate, validateUuidParam } from '../middleware/validate.middleware';
import { createVaultFolderSchema, updateVaultFolderSchema } from '../schemas/vaultFolder.schemas';
import * as vaultFoldersController from '../controllers/vault-folders.controller';

const router = Router();

router.use(authenticate);
router.get('/', vaultFoldersController.list);
router.post('/', validate(createVaultFolderSchema), vaultFoldersController.create);
router.put('/:id', validateUuidParam(), validate(updateVaultFolderSchema), vaultFoldersController.update);
router.delete('/:id', validateUuidParam(), vaultFoldersController.remove);

export default router;
