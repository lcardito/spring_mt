package me.lcardito.spring.dao.tenant;

import me.lcardito.spring.SpectrumTest;
import me.lcardito.spring.model.tenant.Application;
import me.lcardito.spring.model.tenant.SupportedApp;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

@RunWith(SpringRunner.class)
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

    @Test
    public void canFindBySupportedAppId() throws Exception {
        Application application = new Application();
        application.setName("JIRA");
        application.setUrl("http://example.com");
        SupportedApp supportedJira = supportedAppDao.findByName("JIRA").orElseThrow(IllegalStateException::new);
        application.setSupportedApp(supportedJira);

        applicationDao.save(application);

        List<Application> apps = applicationDao.findBySupportedAppId(supportedJira.getId());
        assertNotNull(apps);
        assertFalse(apps.isEmpty());

        Optional<Application> nextApp = applicationDao.findBySupportedAppIdAndName(supportedJira.getId(), "JIRA");
        assertTrue(nextApp.isPresent());

        nextApp = applicationDao.findByUrlLike("%example%");
        assertTrue(nextApp.isPresent());
        Application nextAppModel = nextApp.get();
        assertEquals(nextAppModel.getUrl(), application.getUrl());

        nextAppModel.setUrl("http://anotherExample.com");

        assertEquals(applicationDao.save(nextAppModel).getId(), nextApp.get().getId());
        assertEquals(applicationDao.save(nextAppModel).getUrl(), "http://anotherExample.com");
    }
}
