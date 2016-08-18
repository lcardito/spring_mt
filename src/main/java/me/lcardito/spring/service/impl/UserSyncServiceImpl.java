package me.lcardito.spring.service.impl;

import me.lcardito.spring.confighelper.MultitenancyTemporaryOverride;
import me.lcardito.spring.repository.master.CompanyRepository;
import me.lcardito.spring.service.UserSyncService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.inject.Inject;

@Service
public class UserSyncServiceImpl implements UserSyncService {
    private static final Logger LOGGER = LoggerFactory.getLogger(UserSyncServiceImpl.class);

    @Inject
    private CompanyRepository companyRepository;

    @Override
    @Scheduled(fixedDelay = 500)
    public void syncUsers() {
        LOGGER.info("Running user synchronisation in thread " + Thread.currentThread().getName());

        try (MultitenancyTemporaryOverride tempOverride = new MultitenancyTemporaryOverride()) {

            companyRepository.findAll()
                .stream()
                .parallel()
                .forEach(c -> {
                    tempOverride.setCurrentTenant(c.getCompanyKey());
                    doSyncUser();
                });

        } catch (Exception e) {
            LOGGER.error("Could not synchronise Crowd users", e);
        }
    }

    @Override
    @Transactional(transactionManager = "tenantTransactionManager")
    public void doSyncUser() {
        LOGGER.info("Running user synchronisation for company: " + MultitenancyTemporaryOverride.getCurrentTenant());

    }

}
