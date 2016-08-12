//package com.clearvision.spectrum.liquibase.population;
//
//import liquibase.integration.spring.SpringLiquibase;
//import org.apache.log4j.Logger;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Component;
//
//@Component
//public class Repopulator {
//	private static final Logger LOGGER = Logger.getLogger(Repopulator.class);
//
//	@Autowired
//	private SpringLiquibase springLiquibase;
//
//	public void resetEverything() {
//		LOGGER.warn("Resetting entire database!");
//		try {
//			springLiquibase.setShouldRun(true);
//			// Liquibase will give warnings about drop with cascade, but we still need it as this is what resets the db.
//			springLiquibase.setDropFirst(true);
//			springLiquibase.afterPropertiesSet();
//		} catch (Exception e) {
//			throw new RuntimeException("Fatal error - Liquibase upgrade failed on database reset", e);
//		}
//	}
//}
