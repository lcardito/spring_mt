package me.lcardito.spring.repository.tenant;

import me.lcardito.spring.model.tenant.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByName(String username);
}
