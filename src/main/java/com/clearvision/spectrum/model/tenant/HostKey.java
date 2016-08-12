package com.clearvision.spectrum.model.tenant;

import com.clearvision.spectrum.model.SimpleModel;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

@Entity
@Table(name = "HostKey")
public class HostKey extends SimpleModel<HostKey> {
	@Column(unique = true) // There should only be one key pair per algorithm
	private String algorithm;

	@Column(length = 4000)
	private String privateKey;

	@Column(length = 1000)
	private String publicKey;

	public String getPrivateKey() {
		return privateKey;
	}

	public void setPrivateKey(String privateKey) {
		this.privateKey = privateKey;
	}

	public String getPublicKey() {
		return publicKey;
	}

	public void setPublicKey(String publicKey) {
		this.publicKey = publicKey;
	}

	public String getAlgorithm() {
		return algorithm;
	}

	public void setAlgorithm(String algorithm) {
		this.algorithm = algorithm;
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
