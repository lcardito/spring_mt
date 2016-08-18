package me.lcardito.spring.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;

public interface UserSyncService {
    @Scheduled(fixedDelay = 500)
    void syncUsers();

    @Transactional(transactionManager = "tenantTransactionManager")
    void doSyncUser();
}
