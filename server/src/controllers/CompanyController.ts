import { Request, Response } from 'express';
import { Company } from '../models/Company';
import { User } from '../models/User';
import { Event } from '../models/Event';

export class CompanyController {
	static async getAllCompanies(req: Request, res: Response) {
		try {
			const companies = await Company.find({ relations: ['owner'] });
			return res.status(200).json(companies);
		} catch (error) {
			console.error('Error fetching companies:', error);
			return res.status(500).json({ message: 'Failed to fetch companies' });
		}
	}

	static async getCompanyById(req: Request, res: Response) {
		const { id } = req.params;

		try {
			const company = await Company.findOne({
				where: { id },
				relations: ['owner'],
			});

			if (!company) {
				return res.status(404).json({ message: 'Company not found' });
			}

			return res.status(200).json(company);
		} catch (error) {
			console.error('Error fetching company:', error);
			return res.status(500).json({ message: 'Failed to fetch company' });
		}
	}

	static async createCompany(req: Request, res: Response) {
		const { name, email, location, ownerId } = req.body;

		if (!name || !email || !location || !ownerId) {
			return res.status(400).json({ message: 'Missing required fields' });
		}

		try {
			const owner = await User.findOne({ where: { id: ownerId } });

			if (!owner) {
				return res.status(404).json({ message: 'Owner not found' });
			}

			const company = Company.create({ name, email, location, owner });
			await company.save();

			return res.status(201).json(company);
		} catch (error: any) {
			console.error('Error creating company:', error);
			if (error.code === '23505') {
				return res.status(409).json({ message: 'Company with that name or email already exists' });
			}
			return res.status(500).json({ message: 'Failed to create company' });
		}
	}

	static async updateCompany(req: Request, res: Response) {
		const { id } = req.params;
		const { name, email, location, ownerId } = req.body;

		try {
			const company = await Company.findOne({ where: { id }, relations: ['owner'] });

			if (!company) {
				return res.status(404).json({ message: 'Company not found' });
			}

			if (ownerId) {
				const owner = await User.findOne({ where: { id: ownerId } });
				if (!owner) {
					return res.status(404).json({ message: 'Owner not found' });
				}
				company.owner = owner;
			}

			if (name) company.name = name;
			if (email) company.email = email;
			if (location) company.location = location;

			await company.save();
			return res.status(200).json(company);
		} catch (error: any) {
			console.error('Error updating company:', error);
			if (error.code === '23505') {
				return res.status(409).json({ message: 'Company with that name or email already exists' });
			}
			return res.status(500).json({ message: 'Failed to update company' });
		}
	}

	static async deleteCompany(req: Request, res: Response) {
		const { id } = req.params;

		try {
			const company = await Company.findOne({ where: { id } });

			if (!company) {
				return res.status(404).json({ message: 'Company not found' });
			}

			await company.remove();
			return res.status(200).json({ message: 'Company deleted successfully' });
		} catch (error) {
			console.error('Error deleting company:', error);
			return res.status(500).json({ message: 'Failed to delete company' });
		}
	}

	static async getCompanyOwner(req: Request, res: Response) {
		const { id } = req.params;

		try {
			const company = await Company.findOne({ where: { id }, relations: ['owner'] });

			if (!company) {
				return res.status(404).json({ message: 'Company not found' });
			}

			return res.status(200).json(company.owner);
		} catch (error) {
			console.error('Error fetching company owner:', error);
			return res.status(500).json({ message: 'Failed to fetch company owner' });
		}
	}

	static async getCompanyEvents(req: Request, res: Response) {
		const { id } = req.params;

		try {
			const company = await Company.findOne({ where: { id } });

			if (!company) {
				return res.status(404).json({ message: 'Company not found' });
			}

			const events = await Event.find({
				where: { company: { id: company.id } },
				relations: ['formats', 'themes'],
			});

			return res.status(200).json(events);
		} catch (error) {
			console.error('Error fetching company events:', error);
			return res.status(500).json({ message: 'Failed to fetch company events' });
		}
	}
}
