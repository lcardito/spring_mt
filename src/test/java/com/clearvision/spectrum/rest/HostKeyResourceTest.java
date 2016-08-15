package com.clearvision.spectrum.rest;

import com.clearvision.spectrum.model.tenant.HostKey;
import com.clearvision.spectrum.service.HostKeyService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.CoreMatchers.is;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringRunner.class)
@WebMvcTest(HostKeyResource.class)
public class HostKeyResourceTest {

    @Autowired
    private MockMvc mvc;

    @MockBean
    private HostKeyService hostKeyService;

    @Test
    public void testExample() throws Exception {
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
