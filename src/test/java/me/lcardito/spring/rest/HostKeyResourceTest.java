package me.lcardito.spring.rest;

import me.lcardito.spring.SpectrumTest;
import me.lcardito.spring.model.tenant.HostKey;
import me.lcardito.spring.service.HostKeyService;
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

import static org.hamcrest.CoreMatchers.is;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = {SpectrumTest.class})
public class HostKeyResourceTest {

    private MockMvc mvc;

    @InjectMocks
    private HostKeyResource hostKeyResource;

    @Mock
    private HostKeyService hostKeyService;

    @Before
    public void setUp() throws Exception {
        MockitoAnnotations.initMocks(this);
        mvc = MockMvcBuilders.standaloneSetup(hostKeyResource).build();
    }

    @Test
    public void testCanGetPublicKey() throws Exception {
        HostKey t = new HostKey();
        t.setId(1L);
        t.setPrivateKey("PRIVATE_KEY");
        t.setPublicKey("MY_PUBLIC_KEY");
        t.setAlgorithm("RSA");
        given(hostKeyService.getHostKey("RSA")).willReturn(t);

        this.mvc.perform(get("/host-key/public-key?algorithm=RSA"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id", is(1)))
            .andExpect(jsonPath("$.algorithm", is("RSA")))
            .andExpect(jsonPath("$.privateKey", is("SECRET")))
            .andExpect(jsonPath("$.publicKey", is("MY_PUBLIC_KEY")));

    }
}
