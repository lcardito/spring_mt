package me.lcardito.spring;

import me.lcardito.spring.confighelper.CurrentTenantResolverImpl;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication(exclude = CurrentTenantResolverImpl.class)
@ComponentScan
public class ApplicationTest {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
