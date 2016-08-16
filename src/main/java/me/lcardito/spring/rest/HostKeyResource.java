package me.lcardito.spring.rest;

import me.lcardito.spring.model.tenant.HostKey;
import me.lcardito.spring.service.HostKeyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@RequestMapping(value = "host-key", produces = "application/json")
@Controller
public class HostKeyResource {
    @Autowired
    private HostKeyService hostKeyService;

    @RequestMapping("/public-key")
    public @ResponseBody
    HostKey getHostKey(@RequestParam("algorithm") String algorithm) {
        HostKey hostKey =  hostKeyService.getHostKey(algorithm);
        // hiding the private key when sending the hostKey to the client
        hostKey.setPrivateKey("SECRET");
        return hostKey;
    }
}

