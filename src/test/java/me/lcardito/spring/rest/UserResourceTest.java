package me.lcardito.spring.rest;

import me.lcardito.spring.ApplicationTest;
import me.lcardito.spring.dao.tenant.UserRepository;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Collections;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = {ApplicationTest.class})
public class UserResourceTest {

    private MockMvc mvc;

    @InjectMocks
    private UserResource userResource;

    @Mock
    private UserRepository userRepository;

    @Before
    public void setUp() throws Exception {
        MockitoAnnotations.initMocks(this);
        mvc = MockMvcBuilders.standaloneSetup(userResource).build();
    }

    @Test
    public void testCanGetUsers() throws Exception {
        given(userRepository.findAll()).willReturn(Collections.emptyList());

        this.mvc.perform(get("/user"))
            .andExpect(status().isOk());
    }
}
