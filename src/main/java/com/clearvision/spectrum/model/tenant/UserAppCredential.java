package com.clearvision.spectrum.model.tenant;

import com.clearvision.spectrum.model.SimpleModel;

import javax.persistence.Entity;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name="UserAppCredential")
public class UserAppCredential extends SimpleModel<UserAppCredential> {
	@ManyToOne
	private User user;
	@ManyToOne
	private Application application;
	private String userName;
	private String password;

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public Application getApplication() {
		return application;
	}

	public void setApplication(Application application) {
		this.application = application;
	}

	public String getUserName() {
		return userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}
}
