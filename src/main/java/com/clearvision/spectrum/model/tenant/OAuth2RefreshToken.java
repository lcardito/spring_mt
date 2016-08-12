package com.clearvision.spectrum.model.tenant;

import com.clearvision.spectrum.model.SimpleModel;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import java.util.Date;

@Entity
public class OAuth2RefreshToken extends SimpleModel<OAuth2RefreshToken> {

	@Column(nullable = false, unique = true)
	private String tokenValue;
	private Date expiration;

	@OneToOne(fetch = FetchType.LAZY, orphanRemoval = true, cascade = CascadeType.ALL, optional = false)
	@JoinColumn(name="authenticationId")
	private OAuth2Authentication authentication;

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
