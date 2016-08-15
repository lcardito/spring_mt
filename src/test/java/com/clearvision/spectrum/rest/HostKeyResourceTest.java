package com.clearvision.spectrum.rest;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringRunner.class)
@WebMvcTest(HostKeyResource.class)
public class HostKeyResourceTest {

    @Autowired
    private MockMvc mvc;

    @MockBean
    private HostKeyResource hostKeyResource;

    @Test
    public void testExample() throws Exception {
//        given(this.hostKeyResource.getVehicleDetails("sboot"))
//            .willReturn(new VehicleDetails("Honda", "Civic"));

        this.mvc.perform(get("host-key/public-key?algorithm=RSA").accept(MediaType.TEXT_PLAIN))
            .andExpect(status().isOk()).andExpect(content().string("Honda Civic"));
    }
}
