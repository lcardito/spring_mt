package com.clearvision.spectrum.model.tenant;

import com.clearvision.spectrum.model.SimpleModel;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import java.util.Date;

@Entity
@DiscriminatorValue("access_token")
public class OAuth2AccessToken extends SimpleModel<OAuth2AccessToken> {

	@Column(nullable = false, unique = true)
	private String authenticationKey;

	@Column(nullable = false, unique = true)
	private String tokenValue;

	private Date expiration;

	private String tokenType;

	private String refreshToken;

	@OneToOne(fetch = FetchType.LAZY, orphanRemoval = true, cascade = CascadeType.ALL, optional = false)
	@JoinColumn(name="authenticationId")
	private OAuth2Authentication authentication;

	public String getAuthenticationKey() {
		return authenticationKey;
	}

	public void setAuthenticationKey(String authenticationKey) {
		this.authenticationKey = authenticationKey;
	}

	public String getTokenValue() {
		return tokenValue;
	}

	public void setTokenValue(String value) {
		this.tokenValue = value;
	}

	public Date getExpiration() {
		return expiration != null ? new Date(expiration.getTime()) : null;
	}

	public void setExpiration(Date expiration) {
		this.expiration = expiration != null ? new Date(expiration.getTime()) : null;
	}

	public String getTokenType() {
		return tokenType;
	}

	public void setTokenType(String tokenType) {
		this.tokenType = tokenType;
	}

	public String getRefreshToken() {
		return refreshToken;
	}

	public void setRefreshToken(String refreshToken) {
		this.refreshToken = refreshToken;
	}

	public OAuth2Authentication getAuthentication() {
		return authentication;
	}

	public void setAuthentication(OAuth2Authentication authentication) {
		this.authentication = authentication;
	}

	/**
	 * For clarity, explicitly call equals and hashcode from parent class.
	 */
	@Override
	public boolean equals(Object o) {
		return super.equals(o);
	}

	@Override
	public int hashCode() {
		return super.hashCode();
	}
}
