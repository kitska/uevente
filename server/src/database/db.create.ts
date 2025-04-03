import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { logger } from "../utils/logger";

// Load environment variables
dotenv.config();

const adminDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_ADMIN_USER,
    password: process.env.DB_ADMIN_PASSWORD,
    database: process.env.DB_ADMIN_DB,
    logging: false,
});

export const createUserAndDatabase = async (): Promise<void> => {
    let isConnected = false;

    try {
        await adminDataSource.initialize();
        isConnected = true;
        logger.info("Connected to the default admin database successfully.");

        // Check if the user already exists
        const userExists = await adminDataSource.query(
            `SELECT 1 FROM pg_roles WHERE rolname = '${process.env.DB_USER}';`
        );

        if (userExists.length === 0) {
            // Create the user if it doesn't exist
            await adminDataSource.query(
                `CREATE USER "${process.env.DB_USER}" WITH PASSWORD '${process.env.DB_PASSWORD}';`
            );
            logger.info(`User "${process.env.DB_USER}" created successfully.`);
        } else {
            logger.info(`User "${process.env.DB_USER}" already exists. Skipping user creation.`);
        }

        // Check if the database already exists
        const dbExists = await adminDataSource.query(
            `SELECT 1 FROM pg_database WHERE datname = '${process.env.DB_NAME}';`
        );

        if (dbExists.length === 0) {
            // Create the database if it doesn't exist
            await adminDataSource.query(
                `CREATE DATABASE "${process.env.DB_NAME}" WITH OWNER = "${process.env.DB_USER}";`
            );
            logger.info(`Database "${process.env.DB_NAME}" created successfully.`);
        } else {
            logger.info(`Database "${process.env.DB_NAME}" already exists. Skipping database creation.`);
        }

        // Ensure the public schema is owned by the user
        await adminDataSource.query(`
            ALTER SCHEMA public OWNER TO "${process.env.DB_USER}";
            GRANT USAGE, CREATE ON SCHEMA public TO "${process.env.DB_USER}";
        `);
        logger.info(`Ownership of the public schema transferred to "${process.env.DB_USER}".`);

        // Grant default privileges
        await adminDataSource.query(`
            ALTER DEFAULT PRIVILEGES IN SCHEMA public 
            GRANT ALL ON TABLES TO "${process.env.DB_USER}";
            ALTER DEFAULT PRIVILEGES IN SCHEMA public 
            GRANT ALL ON SEQUENCES TO "${process.env.DB_USER}";
        `);
        logger.info(`Default privileges on tables and sequences granted to "${process.env.DB_USER}".`);
    } catch (error) {
        logger.error("Error creating user and database:", error);
    } finally {
        // await adminDataSource.destroy();
        logger.info("Admin database connection closed.");
    }
};

// Run the script
// createUserAndDatabase();
