package com.clearvision.spectrum.model.tenant;

import com.clearvision.spectrum.model.Filterable;
import com.clearvision.spectrum.model.SimpleModel;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

@Entity
@Table(name = "SpectrumGroup")
public class Group extends SimpleModel {

	@Filterable
	private String name;
	@Column(name = "cvRole")
	private Role role;
	private boolean isExternal;
	private long syncCycle;
	private boolean isDeleted;
	private boolean isActive;

	public Group() {
	}

	public Group(Long id, String name, Role role, boolean isExternal, long syncCycle, boolean isDeleted, Boolean isActive) {
		setId(id);
		this.name = name;
		this.role = role;
		this.isExternal=isExternal;
		this.syncCycle=syncCycle;
		this.isDeleted=isDeleted;
		this.isActive=isActive;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Role getRole() {
		return role;
	}

	public void setRole(Role role) {
		this.role = role;
	}

	public boolean isExternal() {
		return isExternal;
	}

	public void setExternal(boolean isExternal) {
		this.isExternal = isExternal;
	}

	public long getSyncCycle() {
		return syncCycle;
	}

	public void setSyncCycle(long syncCycle) {
		this.syncCycle = syncCycle;
	}

	public boolean isDeleted() {
		return isDeleted;
	}

	public void setDeleted(boolean isDeleted) {
		this.isDeleted = isDeleted;
	}

	public boolean isActive() {
		return isActive;
	}

	public void setActive(boolean isActive) {
		this.isActive = isActive;
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
