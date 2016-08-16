//package com.clearvision.spectrum.liquibase.population;
//
//import liquibase.database.Database;
//import liquibase.database.DatabaseFactory;
//import liquibase.database.ext.PostgresDatabaseNoQuoting;
//import liquibase.exception.LiquibaseException;
//import org.apache.log4j.Logger;
//import org.springframework.beans.factory.InitializingBean;
//
//import java.util.List;
//
//public class CVSpringLiquibase extends liquibase.integration.spring.SpringLiquibase implements InitializingBean {
//	private static final Logger LOGGER = Logger.getLogger(CVSpringLiquibase.class);
//	@Override
//	public void afterPropertiesSet() throws LiquibaseException {
//		// We need to override the built-in database driver for Postgres. In order to ensure that it picks up
//		// our implementation at all times, we must clear the registry and replace the built-in Postgres database
//		// implementation with ours. Having both in the list results in Liquibase switching between the two
//		// implementations seemingly at random.
//		List<Database> databases = DatabaseFactory.getInstance().getImplementedDatabases();
//		DatabaseFactory.getInstance().clearRegistry();
//		for (Database db : databases) {
//			if (db.getShortName().equals("postgresql"))
//				DatabaseFactory.getInstance().register(new PostgresDatabaseNoQuoting());
//			else
//				DatabaseFactory.getInstance().register(db);
//		}
//
//		// Now let Liquibase do its magic...
//		try {
//			super.afterPropertiesSet();
//		} catch (Exception ex) {
//			LOGGER.error(ex.getMessage());
//			throw ex;
//		}
//	}
//}
