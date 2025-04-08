import { Request, Response } from 'express';
import { User } from '../models/User';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_API_KEY!);
