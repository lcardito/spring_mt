package me.lcardito.spring.repository.tenant;

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
public class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    public void creatingAnUser() {
        User user = new User();
        user.setName("Luigi");
        user.setActive(true);
        user.setPassword("AVerySecurePassword");
        user.setEmail("nice@mail.com");

        userRepository.save(user);
    }
}
