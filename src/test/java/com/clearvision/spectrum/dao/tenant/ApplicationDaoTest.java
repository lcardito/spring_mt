package com.clearvision.spectrum.dao.tenant;

import com.clearvision.spectrum.SpectrumTest;
import com.clearvision.spectrum.model.tenant.Application;
import com.clearvision.spectrum.model.tenant.SupportedApp;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

@RunWith(SpringJUnit4ClassRunner.class)
@SpringBootTest(classes = {SpectrumTest.class})
@Transactional("tenantTransactionManager")
public class ApplicationDaoTest {

    @Autowired
    private ApplicationDao applicationDao;

    @Autowired
    private SupportedAppDao supportedAppDao;

    @Test
    public void creatingApps() {
        Application application = new Application();
        application.setName("JIRA");
        application.setUrl("http://example.com");
        Optional<SupportedApp> supportedJira = supportedAppDao.findByName("JIRA");
        if (supportedJira.isPresent()) {
            application.setSupportedApp(supportedJira.get());
        }

        applicationDao.save(application);
        Optional<Application> exampleJira = applicationDao.findByName("JIRA");
        assertTrue(exampleJira.isPresent());
        assertEquals(exampleJira.get().getUrl(), "http://example.com");
    }

}
