package me.lcardito.spring.config;

import me.lcardito.spring.confighelper.TenantIdentifierInterceptorAdapter;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

import javax.inject.Inject;

@Configuration
@EnableAsync
@EnableScheduling
public class WebMvcConfig extends WebMvcConfigurerAdapter {

    @Inject
    private TenantIdentifierInterceptorAdapter multiTenancyInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(multiTenancyInterceptor);
    }
}
