package me.lcardito.spring.dao.tenant;

import me.lcardito.spring.model.tenant.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserDao extends JpaRepository<User, Long> {
    Optional<User> findByName(String username);
}
