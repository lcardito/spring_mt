//package com.clearvision.spectrum.dao.tenant;
//
//import com.clearvision.spectrum.model.tenant.Application;
//import org.junit.Test;
//import org.junit.runner.RunWith;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
//import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.test.context.junit4.SpringRunner;
//
//import static org.junit.Assert.assertEquals;
//
//@RunWith(SpringRunner.class)
//@DataJpaTest
//@SpringBootTest
//public class ApplicationDaoTest {
//
//    @Autowired
//    private TestEntityManager entityManager;
//
//    @Autowired
//    private ApplicationDao applicationDao;
//
//    @Test
//    public void savingUsers() {
//
//        Application application = new Application();
//        application.setName("JIRA");
//        application.setUrl("http://example.com");
//        Application saved = applicationDao.save(application);
//
//        assertEquals(application, applicationDao.findByName("JIRA"));
//    }
//
//}
