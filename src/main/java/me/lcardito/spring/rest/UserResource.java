package me.lcardito.spring.rest;

import me.lcardito.spring.repository.tenant.UserRepository;
import me.lcardito.spring.model.tenant.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class UserResource {

    @Autowired
    private UserRepository userRepository;

    @RequestMapping("/user")
    public @ResponseBody
    List<User> getUsers() {
        return userRepository.findAll();
    }
}

