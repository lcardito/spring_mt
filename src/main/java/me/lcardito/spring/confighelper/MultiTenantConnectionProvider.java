package me.lcardito.spring.confighelper;

import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;

public interface MultiTenantConnectionProvider extends ApplicationListener<ContextRefreshedEvent> {
    void onBoardNewCustomers();
}
