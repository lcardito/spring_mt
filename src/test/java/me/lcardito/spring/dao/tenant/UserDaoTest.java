package me.lcardito.spring.dao.tenant;

import me.lcardito.spring.ApplicationTest;
import me.lcardito.spring.model.tenant.User;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = {ApplicationTest.class})
@Transactional("tenantTransactionManager")
public class UserDaoTest {

    @Autowired
    private UserDao userDao;

    @Test
    public void creatingAnUser() {
        User user = new User();
        user.setName("Luigi");
        user.setActive(true);
        user.setPassword("AVerySecurePassword");
        user.setEmail("nice@mail.com");

        userDao.save(user);
    }

    @Test
    public void canFindBySupportedAppId() throws Exception {
//        Application application = new Application();
//        application.setName("JIRA");
//        application.setUrl("http://example.com");
//        SupportedApp supportedJira = supportedAppDao.findByName("JIRA").orElseThrow(IllegalStateException::new);
//        application.setSupportedApp(supportedJira);
//
//        userDao.save(application);
//
//        List<Application> apps = userDao.findBySupportedAppId(supportedJira.getId());
//        assertNotNull(apps);
//        assertFalse(apps.isEmpty());
//
//        Optional<Application> nextApp = userDao.findBySupportedAppIdAndName(supportedJira.getId(), "JIRA");
//        assertTrue(nextApp.isPresent());
//
//        nextApp = userDao.findByUrlLike("%example%");
//        assertTrue(nextApp.isPresent());
//        Application nextAppModel = nextApp.get();
//        assertEquals(nextAppModel.getUrl(), application.getUrl());
//
//        nextAppModel.setUrl("http://anotherExample.com");
//
//        assertEquals(userDao.save(nextAppModel).getId(), nextApp.get().getId());
//        assertEquals(userDao.save(nextAppModel).getUrl(), "http://anotherExample.com");
    }
}
