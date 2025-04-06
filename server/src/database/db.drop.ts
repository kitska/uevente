import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { logger } from "../utils/logger";

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

const deleteUserAndDatabase = async (): Promise<void> => {
    try {
        await adminDataSource.initialize();
        logger.info("Connected to the default admin database successfully.");

        await adminDataSource.query(`
            SELECT pg_terminate_backend(pid)
            FROM pg_stat_activity
            WHERE datname = $1 AND pid <> pg_backend_pid();
        `, [process.env.DB_NAME]);
        logger.info(`Terminated active connections to database "${process.env.DB_NAME}".`);

        const dbExists = await adminDataSource.query(`
            SELECT 1 FROM pg_database WHERE datname = $1;
        `, [process.env.DB_NAME]);

        if (dbExists.length > 0) {
            await adminDataSource.query(`
                DROP DATABASE IF EXISTS "${process.env.DB_NAME}";
            `);
            logger.info(`Database "${process.env.DB_NAME}" dropped successfully.`);
        } else {
            logger.info(`Database "${process.env.DB_NAME}" does not exist. Skipping database drop.`);
        }

        const userExists = await adminDataSource.query(`
            SELECT 1 FROM pg_roles WHERE rolname = $1;
        `, [process.env.DB_USER]);

        if (userExists.length > 0) {
            await adminDataSource.query(`
                ALTER SCHEMA public OWNER TO CURRENT_USER;
            `);
            logger.info(`Ownership of schema "public" reassigned to the current user.`);

            await adminDataSource.query(`
                ALTER DEFAULT PRIVILEGES IN SCHEMA public
                REVOKE ALL ON TABLES FROM "${process.env.DB_USER}";
            `);
            await adminDataSource.query(`
                ALTER DEFAULT PRIVILEGES IN SCHEMA public
                REVOKE ALL ON SEQUENCES FROM "${process.env.DB_USER}";
            `);
            await adminDataSource.query(`
                ALTER DEFAULT PRIVILEGES IN SCHEMA public
                REVOKE ALL ON FUNCTIONS FROM "${process.env.DB_USER}";
            `);
            logger.info(`Default privileges for user "${process.env.DB_USER}" revoked.`);

            await adminDataSource.query(`
                DROP USER IF EXISTS "${process.env.DB_USER}";
            `);
            logger.info(`User "${process.env.DB_USER}" dropped successfully.`);
        } else {
            logger.info(`User "${process.env.DB_USER}" does not exist. Skipping user drop.`);
        }
    } catch (error) {
        logger.error("Error deleting user or database:", error);
    } finally {
        await adminDataSource.destroy();
    }
};


deleteUserAndDatabase();