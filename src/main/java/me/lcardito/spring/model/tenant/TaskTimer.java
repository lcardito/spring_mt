package me.lcardito.spring.model.tenant;

import me.lcardito.spring.model.SimpleModel;

import javax.persistence.Entity;
import javax.persistence.OneToOne;
import javax.persistence.Table;

@Entity
@Table(name = "TaskTimer")
public class TaskTimer extends SimpleModel<TaskTimer> {
	@OneToOne
	private User        user;
	@OneToOne
	private Application application;
	private String remoteId;
	private long        startTime;

	public TaskTimer() { }

	public TaskTimer(User user, Application application, String remoteId, long startTime) {
		this.user = user;
		this.application = application;
		this.remoteId = remoteId;
		this.startTime = startTime;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public void setApplication(Application application) {
		this.application = application;
	}

	public String getRemoteId() {
		return remoteId;
	}

	public void setRemoteId(String remoteId) {
		this.remoteId = remoteId;
	}

	public long getStartTime() {
		return startTime;
	}

	public void setStartTime(long startTime) {
		this.startTime = startTime;
	}


	public User getUser() {
		return user;
	}

	public Long getAppId() {
		return application.getId();
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

	public Application getApplication() {
		return application;
	}
}
