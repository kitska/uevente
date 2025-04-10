import { Router } from 'express';
import { CompanyController } from '../controllers/CompanyController';

const router = Router();

router.get('/', CompanyController.getAllCompanies.bind(CompanyController));

router.get('/:id', CompanyController.getCompanyById.bind(CompanyController));

router.post('/', CompanyController.createCompany.bind(CompanyController));

router.patch('/:id', CompanyController.updateCompany.bind(CompanyController));

router.delete('/:id', CompanyController.deleteCompany.bind(CompanyController));

router.get('/:id/owner', CompanyController.getCompanyOwner.bind(CompanyController));

router.get('/:id/events', CompanyController.getCompanyEvents.bind(CompanyController));

export default router;
