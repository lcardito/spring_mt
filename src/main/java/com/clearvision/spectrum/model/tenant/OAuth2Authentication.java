package com.clearvision.spectrum.model.tenant;

import com.clearvision.spectrum.model.SimpleModel;

import javax.persistence.CollectionTable;
import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.MapKeyColumn;
import java.util.Map;
import java.util.Set;

@Entity
public class OAuth2Authentication extends SimpleModel<OAuth2Authentication> {

	@ElementCollection
	@MapKeyColumn(name="attributeName")
	@Column(name="attributeValue")
	@CollectionTable(name="OAuth2RequestAttributes", joinColumns=@JoinColumn(name="authenticationId"))
	private Map<String, String> requestAttributes;

	private String userName;

	private String clientId;

	@ElementCollection
	@CollectionTable(name="OAuth2AuthScopes", joinColumns=@JoinColumn(name="authenticationId"))
	private Set<String> scopes;

	public Map<String, String> getRequestAttributes() {
		return requestAttributes;
	}

	public void setRequestAttributes(Map<String, String> requestAttributes) {
		this.requestAttributes = requestAttributes;
	}

	public String getUserName() {
		return userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}

	public String getClientId() {
		return clientId;
	}

	public void setClientId(String clientId) {
		this.clientId = clientId;
	}

	public Set<String> getScopes() {
		return scopes;
	}

	public void setScopes(Set<String> scopes) {
		this.scopes = scopes;
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
