package me.lcardito.spring.confighelper;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import liquibase.Liquibase;
import liquibase.database.Database;
import liquibase.database.DatabaseFactory;
import liquibase.database.jvm.JdbcConnection;
import liquibase.exception.LiquibaseException;
import liquibase.resource.ClassLoaderResourceAccessor;
import me.lcardito.spring.model.master.Company;
import me.lcardito.spring.repository.master.CompanyRepository;
import me.lcardito.spring.util.Utils;
import org.hibernate.engine.jdbc.connections.spi.AbstractDataSourceBasedMultiTenantConnectionProviderImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.PostConstruct;
import javax.inject.Inject;
import javax.sql.DataSource;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

//Note - This file creates the tennanted database stuff within liquibase
@Component
@Transactional(value="masterTransactionManager", readOnly = true)
public class MultiTenantConnectionProviderImpl extends AbstractDataSourceBasedMultiTenantConnectionProviderImpl implements MultiTenantConnectionProvider {
    private final static Logger LOGGER = LoggerFactory.getLogger(MultiTenantConnectionProviderImpl.class);

    private Map<String, DataSource> map; // map holds the companyKey => DataSource

    @Inject
    private CompanyRepository companyRepository;

    @Value("${spring.datasource.url}")
    private String url;

    @Value("${spring.datasource.dataSourceClassName}")
    private String dataSourceClassName;

    @Value("${spring.datasource.username}")
    private String user;

    @Value("${spring.datasource.password}")
    private String password;

    @Inject
    private DataSource dataSource; // injected here to get properties and to provide default.

    @PostConstruct
    public void load() {
        map = new HashMap<>();
    }


    @Scheduled(fixedDelay = 600000)
    public void onBoardNewCustomers() {
        LOGGER.debug("Scanning for new customer in master db");
        companyRepository.findAll()
            .stream()
            .filter(c -> !map.containsKey(c.getCompanyKey()))
            .forEach(this::configureNewCompany);
    }

    private void configureNewCompany(Company company) {
        try {
            String companyDbUrl = url.replace(Utils.databaseNameFromJdbcUrl(url), company.getCompanyKey());
            LOGGER.debug("Configuring datasource {} {} {}", dataSourceClassName, companyDbUrl, user);
            HikariConfig config = new HikariConfig();
            config.setDataSourceClassName(dataSourceClassName);
            config.addDataSourceProperty("url", companyDbUrl);
            config.addDataSourceProperty("user", user);
            config.addDataSourceProperty("password", password);
            HikariDataSource ds = new HikariDataSource(config);
            map.put(company.getCompanyKey(), ds);
            initDbWithLiquibase(ds);
        } catch (Exception e) {
            LOGGER.error("Error in database URL {}", url, e);
        }
    }

    private void initDbWithLiquibase(HikariDataSource ds) throws SQLException, LiquibaseException {
        Database database = DatabaseFactory.getInstance().findCorrectDatabaseImplementation(
                new JdbcConnection(ds.getConnection()));
        Liquibase liquibase = new Liquibase("db-changelog.xml", new ClassLoaderResourceAccessor(), database);
        liquibase.update("test, production");
    }

    @Override
    protected DataSource selectAnyDataSource() {
        LOGGER.debug("Selecting any data source");
        return dataSource;
    }

    @Override
    protected DataSource selectDataSource(String tenantIdentifier) {
        LOGGER.debug("Selecting data source for {}", tenantIdentifier);
        return map.containsKey(tenantIdentifier) ? map.get(tenantIdentifier) : dataSource ;
    }

    @Override
    public void onApplicationEvent(ContextRefreshedEvent contextRefreshedEvent) {
        companyRepository.findAll().forEach(this::configureNewCompany);
    }
}
