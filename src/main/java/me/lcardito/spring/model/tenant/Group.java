package me.lcardito.spring.model.tenant;

import me.lcardito.spring.model.SimpleModel;

import javax.persistence.Entity;
import javax.persistence.Table;

@Entity
@Table
public class Group extends SimpleModel {

	private String name;
	private Role role;
	private boolean isActive;

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


	public boolean isActive() {
		return isActive;
	}

	public void setActive(boolean isActive) {
		this.isActive = isActive;
	}
}
