package com.clearvision.spectrum.dao.tenant;

import com.clearvision.spectrum.Spectrum;
import com.clearvision.spectrum.model.tenant.Application;
import com.clearvision.spectrum.model.tenant.SupportedApp;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.transaction.annotation.Transactional;

import javax.inject.Inject;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = {Spectrum.class})
@Transactional("tenantTransactionManager")
public class ApplicationDaoTest {

	@Inject
	private ApplicationDao applicationDao;

    @Inject
    private SupportedAppDao supportedAppDao;

	private SupportedApp supportedApp;

	@Before
	public void setUp() throws Exception {
		supportedApp = new SupportedApp("app", "1.1","1.4");
        supportedAppDao.save(supportedApp);
    }

	@Test
	@Transactional
	public void testCreateApplication() throws Exception {
		Application app = new Application();
		app.setName("JIRA");
		app.setUrl("http://localhost/jira");
	    app.setSupportedApp(supportedApp);
		applicationDao.create(app);
		assertNotNull(app.getId());
	}

	@Test
	 @Transactional
	 public void testUpdate() throws Exception {
		Application app = createApplicationFromSession("jira");
		String newApplication = "confluence";
		app.setName(newApplication);
		applicationDao.update(app);

		Application updatedApplication = applicationDao.getOne(app.getId());
		assertNotNull(updatedApplication);
		assertNotNull(updatedApplication.getId());
		assertEquals(newApplication, updatedApplication.getName());
	}

	@Test
	@Transactional
	public void testDelete() throws Exception {
		Application application = createApplicationFromSession("jira");
		Application application2 = createApplicationFromSession("confluence");

		applicationDao.delete(application);
		assertNull(applicationDao.getOne(application.getId()));

		applicationDao.delete(application2);
		assertNull(applicationDao.getOne(application2.getId()));
	}

	@Test
	@Transactional
	public void testFindByName() throws Exception {
		String applicationName = "jira";
		createApplicationFromSession(applicationName);

		String applicationName2 = "confluence";
		createApplicationFromSession(applicationName2);

		Application foundApplication = applicationDao.findByName(applicationName);
		assertNotNull(foundApplication);
		assertNotNull(foundApplication.getId());
		assertEquals(applicationName, foundApplication.getName());

		Application foundApplication2 = applicationDao.findByName(applicationName2);
		assertNotNull(foundApplication2);
		assertNotNull(foundApplication2.getId());
		assertEquals(applicationName2, foundApplication2.getName());
	}

	@Test
	@Transactional
	public void testCount() throws Exception {
		createApplicationFromSession("jira");
		createApplicationFromSession("confluence");

		assertEquals(2, applicationDao.findAll().size());
	}

	@Test
	@Transactional
	public void testApplicationExists() throws Exception {
		String applicationName = "jira";
		createApplicationFromSession(applicationName);
		assertTrue(applicationDao.applicationExists(applicationName));
	}

	private Application createApplicationFromSession(String appName) {
		Application application = new Application();
		application.setName(appName);
		application.setUrl("http://localhost/jira");
		application.setSupportedApp(supportedApp);
        applicationDao.save(application);
        return application;
	}

//	private Application getApplicationViaSession(Application sessionApplication) {
//		Session session = em.unwrap(Session.class);
//		session.flush();
//		return (Application)session.get(Application.class, sessionApplication.getId());
//	}

}
