package me.lcardito.spring.dao.tenant;

import me.lcardito.spring.model.tenant.OAuth2RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OAuth2RefreshTokenDao extends JpaRepository<OAuth2RefreshToken, Long> {

//	OAuth2RefreshToken findByTokenValue(String tokenValue);
//
////	OAuth2Authentication findAuthenticationByToken(String tokenValue);
////
////	List<OAuth2RefreshToken> findByUserName(String userName);
//
//	void flush();
}
